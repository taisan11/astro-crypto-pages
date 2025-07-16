Bun.build({
    entrypoints:["./decrypt.ts"],
    minify:true,
    outdir:"./",
    target: "browser",
    format: "esm",
})