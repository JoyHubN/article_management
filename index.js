const fs = require('fs');

const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');

const { idSchema, articleSchema } = require('./validation/schemes');
const { checkParams, checkBody } = require('./validation/validated');

const DATA_PATH = path.join(__dirname, '/data.json');
const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('static'));
app.use(express.json());


app.get('/', async(req, res)=>{
    fs.readFile(DATA_PATH, 'utf8', (err, mess)=>{
    
    const dataJson = JSON.parse(mess);
    res.render('main', 
        {title:'Home', layout: 'home', dataJson}
    )

    });
});

app.get('/articles', async(req, res)=>{
    fs.readFile(DATA_PATH, 'utf-8', (err, mess)=>{
        res.send(JSON.parse(mess));

    });
});


app.get('/articles/:id', checkParams(idSchema), (req, res)=>{
    fs.readFile(DATA_PATH, 'utf-8', (err, mess)=>{
        const jsonData = JSON.parse(mess);

        const article = jsonData.articles.find((data=>data.id===Number(req.params.id)))
            if(article){
                res.send({article});
            }
            
            else{
                res.status(404);
                res.send({article: null});
            }
    });
});


app.post('/articles', checkBody(articleSchema), (req,res)=>{
    const data = fs.readFileSync(DATA_PATH, 'utf8');

    const dataJson = JSON.parse(data);
    let lengthArticles = dataJson.articles[dataJson.articles.length-1].id+1;

    const newArticle = {
        id: lengthArticles,
        ...req.body
    };

    dataJson.articles.push(newArticle);

    fs.writeFileSync(DATA_PATH, JSON.stringify(dataJson, null, 2), 'utf-8');

    res.status(201).send({
        id: lengthArticles,
    });
});


app.put('/articles/:id', checkParams(idSchema), checkBody(articleSchema), (req, res)=>{
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    const dataJson = JSON.parse(data);
    const article = dataJson.articles.find((article)=> article.id === Number(req.params.id));

    if(article){
        article.title = req.body.title;
        article.description = req.body.description;

        fs.writeFileSync(DATA_PATH, JSON.stringify(dataJson, null, 2), 'utf-8');

        res.status(201).send({
            message:'Успешно обновлено',
            article
        });
    }
    else{
        res.status(404).send({article: null})
        
    }
});

app.delete('/articles/:id', checkParams(idSchema), (req, res)=>{
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    const dataJson = JSON.parse(data);
    const article = dataJson.articles.find((article)=> article.id === Number(req.params.id));

    if(article){
        const articleIndex = dataJson.articles.indexOf(article);
        dataJson.articles.splice(articleIndex, 1);

        fs.writeFileSync(DATA_PATH, JSON.stringify(dataJson, null, 2), 'utf-8');

        res.send({article});
    }
    else{
        res.status(404).send({article: null});
    }
})

app.use((req,res)=>{
    console.log('req', req.method, req.url, req.params);

    res.status(404).send({message: 'URL not found!'})
})

const port = 3000;

app.listen(port, ()=>{
    console.log(`Сервер запущен localhost:${port}`)
})
