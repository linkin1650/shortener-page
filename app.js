const express = require('express')
const { engine } = require('express-handlebars')
const fs = require('fs')
const jsonFilePath = './public/jsons/data.json'
const bodyParser = require('body-parser');
const generateRandomString = require('./public/javascripts/randomGenerator.js')

const app = express()
const port = 3000

app.engine('.hbs', engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

//讀取 JSON 檔案數據
function readJSONFile() {
  try {
    const data = fs.readFileSync(jsonFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading JSON file: ', error);
    return null;
  }
}

//修改 JSON 檔案數據
function writeJSONFile(data) {
  try {
    const jsonData = JSON.stringify(data, null, 2)
    fs.writeFileSync(jsonFilePath, jsonData, 'utf8')
    console.log('JSON file has been updated')
  } catch (error) {
    console.error('Error writing JSON file: ', error);
  }
}

//檢查是否有重複的 URL 紀錄
function findExistingUrl(urls, newUrl) {
  return urls.find(urlObj => urlObj.url === newUrl)
}

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/', (req, res) => {
  //讀取 JSON 檔案
  const jsonData = readJSONFile()

  //取得前端 post 的 URL
  const { url } = req.body
  console.log('Submitted URL:', url)

  const originalURL = url

  //檢查是否已有對應的短網址
  const existingURL = findExistingUrl(jsonData.urls, originalURL)

  //使用已有的短網址
  if (existingURL) {
    const shortURL = existingURL.shortUrl
    console.log('原網址存在: ' + shortURL)
    res.render('index', { shortURL });
  } else {
    //生成新的縮短網址
    const shortURL = generateRandomString(5)
    console.log('原網址不存在，生成:' + shortURL)

    //將資料記錄至 JSON
    jsonData.urls.push({ url: originalURL, shortUrl: shortURL })
    writeJSONFile(jsonData)

    res.render('index', { shortURL });
  }
})

app.get('/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL

  //讀取 JSON 數據
  const jsonData = readJSONFile()

  //查找短網址
  const existingURL = jsonData.urls.find(urlObj => urlObj.shortUrl === shortURL)
  if (existingURL) {
    res.redirect(existingURL.url)
  } else {
    res.status(404).send('Short URL not found')
  }
})

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})