import fs from "fs"
fs.readFile("./package.json", (_, data) => {
    console.table(JSON.parse(data.toString())["scripts"])
})
