
var fs = require('fs')
var path = require('path')
var basePath = 'docs'
let markdown = require('markdown-it')
var md = new markdown({
    html: true,
    langPrefix: 'code-',
})
const config = require('./pass.json')

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

function readPassFromFs() {
    var keyPath = path.resolve()
    return fs.readFileSync(keyPath, 'utf-8')
}

function main() {
    console.log('Starting web server')
    var express = require('express')
    var cookieParser = require('cookie-parser')

    var app = express()
    app.use(express.static('.'))

    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(cookieParser(config.cookiePaser))

    app.use(function (req, res, next) {
        var username = req.signedCookies.username
        if (req.method === 'POST' && !username && req.url !== '/auth') {
            res.send('Unauthorized.')
            res.end()
        }
        else next()
    })


    app.post('/auth', function (req, res, next) {
        if (req.body.key === config.pass)
            res.cookie("username", "admin", { maxAge: 60 * 60 * 1000, signed: true });
        res.send('OK')
    })

    app.get('/logout', function (req, res, next) {
        res.clearCookie('username')
        res.send('OK')
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