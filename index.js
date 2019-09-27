
var fs = require('fs')
var path = require('path')
var basePath = 'docs'
let markdown = require('markdown-it')
var md = new markdown({
    html: true,
    langPrefix: 'code-',
})

function mkCate(cate) {
    fs.mkdir(path.join(basePath, cate), function (err) {

    })
}

function getDirsInDocsFolder() {
    var paths = fs.readdirSync(basePath)
    return paths
}

function getMdsInFolder(folderName) {
    let paths = fs.readdirSync(path.join(basePath, folderName))
    return paths
}

function writeMdFile(folderPath, fileName, content) {
    fs.writeFile(path.join(basePath, folderPath, fileName), content, function (err) {
        console.error(err)
    })
}

function readMd(fileName, folderPath) {
    let content = fs.readFileSync(path.join(basePath, folderPath, fileName), 'utf-8')
    return content
}

function readMdFileToHtml(fileName, folderPath) {
    var content = readMd(fileName, folderPath)
    var html = md.render(content)
    return html
}


function main() {
    console.log('Starting web server')
    var express = require('express')
    var app = express()
    app.use(express.static('.'))

    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get('/', function (req, res, next) {
    })


    app.get('/cates', function (req, res, next) {
        var list = getDirsInDocsFolder()
        res.send(list)
    })

    app.post('/cate', function (req, res, next) {
        const { cate } = req.body
        mkCate(cate)
        res.send(cate)
    })

    app.get('/mds', function (req, res, next) {
        const { cate } = req.query
        if (!cate) res.send([])
        var mds = getMdsInFolder(cate)
        res.send(mds)
    })


    app.get('/mdhtml', function (req, res, next) {
        const { cate, name } = req.query
        var html = readMdFileToHtml(`${name}`, cate)
        res.send(html)
    })
    app.get('/md', function (req, res, next) {
        const { cate, name } = req.query
        var md = readMd(`${name}`, cate)
        res.send(md)
    })

    app.post('/md', function (req, res, next) {
        const { cate, name, content } = req.body
        writeMdFile(cate, name, content)
        res.send(content)

    })


    var server = app.listen(8081, function () {
        const { address, port } = server.address()
        console.log('Listening on http://%s:%s', address, port)

    })


}
main();