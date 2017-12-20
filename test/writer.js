"use strict";

const wp = require("../lib/webidl2");
const writer = require("../lib/writer");
const expect = require("expect");
const pth = require("path");
const fs = require("fs");
const jdp = require("jsondiffpatch");
const debug = true;

describe("Rewrite and parses all of the IDLs to produce the same ASTs", () => {
  const dir = pth.join(__dirname, "syntax/idl");
  const skip = {}; // use if we have a broken test
  const idls = fs.readdirSync(dir)
    .filter(it => (/\.widl$/).test(it) && !skip[it])
    .map(it => pth.join(dir, it));

  for (const idl of idls) {
    const json = pth.join(__dirname, "syntax/json", pth.basename(idl).replace(".widl", ".json"));

    it(`should produce the same AST for ${idl}`, () => {
      try {
        const ast = JSON.parse(fs.readFileSync(json, "utf8"));
        const optFile = pth.join(__dirname, "syntax/opt", pth.basename(json));
        let opt = undefined;
        if (fs.existsSync(optFile))
          opt = JSON.parse(fs.readFileSync(optFile, "utf8"));
        const diff = jdp.diff(ast,
          wp.parse(writer.write(ast), opt));
        if (diff && debug) console.log(JSON.stringify(diff, null, 4));
        expect(diff).toBe(undefined);
      }
      catch (e) {
        console.log(e.toString());
        throw e;
      }
    });
  }
});