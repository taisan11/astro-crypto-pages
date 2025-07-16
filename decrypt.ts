import {decryptWithPassword} from "./core"

document.querySelectorAll<HTMLDivElement>('div[data-enc]').forEach(async (div) => {
    div.innerHTML = `<h4>この部分は暗号化されています。</h4><input type="password" placeholder="パスワード"><button>復号</button>`;
    const input = div.querySelector('input[type="password"]') as HTMLInputElement;
    const button = div.querySelector('button') as HTMLButtonElement;
    const encrypted = div.getAttribute('data-enc');
    button.addEventListener('click', async () => {
        const password = input.value;
        if (!password) return;
        try {
            const decrypted = await decryptWithPassword(encrypted!, password);
            div.outerHTML = decrypted;
        } catch (e) {
            div.textContent = 'Decryption failed';
        }
    });
});