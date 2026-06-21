import fs from "fs";

const src = fs.readFileSync("../../nf-anglers-club.jsx", "utf8").replace(
  /\r\n/g,
  "\n"
);

function extract(name) {
  const start = src.indexOf(`const ${name} = "`) + `const ${name} = "`.length;
  const end = src.indexOf('"', start);
  return src.slice(start, end);
}

const out = `export const NF_LOGO_SM = ${JSON.stringify(extract("NF_LOGO_SM"))};
export const NF_LOGO_MD = ${JSON.stringify(extract("NF_LOGO_MD"))};
export const NF_LOGO_LG = ${JSON.stringify(extract("NF_LOGO_LG"))};
`;

fs.writeFileSync("../lib/nf-logos.js", out.replace(/\r\n/g, "\n"));
console.log("written", out.length, "bytes");
