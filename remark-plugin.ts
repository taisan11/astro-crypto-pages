import type {Root} from "mdast"
import { visit } from 'unist-util-visit'
import * as yaml from 'js-yaml'
import { unified } from 'unified'
import remarkStringify from 'remark-stringify'
import { encryptWithPassword } from './core.js'

// プラグインの型定義
const remarkMyPlugin = () => {
    return async function (tree: Root) {
        let frontmatterNode: any = null;
        let frontmatterData: any = null;
        
        // フロントマターノードを探す
        visit(tree, 'yaml', (node) => {
            if (frontmatterNode === null) {
                frontmatterNode = node;
                try {
                    frontmatterData = yaml.load(node.value as string);
                } catch (e) {
                    console.error('Failed to parse frontmatter:', e);
                }
            }
        });
        
        // パスワードが設定されている場合に暗号化
        if (frontmatterData && frontmatterData.password) {
            const password = frontmatterData.password;
            
            // フロントマター以外のすべてのコンテンツを取得
            const contentNodes = tree.children.filter(child => child.type !== 'yaml');
            
            // コンテンツをMarkdownテキストに変換
            const processor = unified().use(remarkStringify);
            const contentTree: Root = { type: 'root', children: contentNodes };
            const contentText = processor.stringify(contentTree);
            
            try {
                // コンテンツを暗号化
                const encryptedContent = await encryptWithPassword(contentText, password);
                
                // フロントマターからパスワードを削除
                delete frontmatterData.password;
                frontmatterData.encrypted = true;
                
                // フロントマターを更新
                if (frontmatterNode) {
                    frontmatterNode.value = yaml.dump(frontmatterData);
                }
                
                // ASTを暗号化されたコンテンツで置換
                tree.children = tree.children.filter(child => child.type === 'yaml');
                tree.children.push({
                    type: 'html',
                    value: `<div data-encrypted="true" style="display:none;">${encryptedContent}</div>`
                });
                
                // 暗号化されていることを示すメッセージを追加
                tree.children.push({
                    type: 'paragraph',
                    children: [{
                        type: 'text',
                        value: 'このコンテンツは暗号化されています。パスワードを入力して復号化してください。'
                    }]
                });
                
            } catch (e) {
                console.error('Failed to encrypt content:', e);
            }
        }
    };
};

export default remarkMyPlugin;