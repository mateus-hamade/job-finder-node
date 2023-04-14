const express    = require('express');
const exphbs     = require('express-handlebars');
const Sequelize  = require('sequelize');
const bodyParser = require('body-parser');
const db         = require('./db/connection');
const path       = require('path');
const app        = express();
const Job        = require('./models/Job');

const OP         = Sequelize.Op;
const PORT       = 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// body parser
app.use(bodyParser.urlencoded({ extended: false }));

// handlebars
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// db connection
db
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// routes
app.get('/', (req, res) => {
    let search = req.query.job;

    if (!search) {
        Job.findAll({
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .then(jobs => {
            res.render('index', {
                jobs
            });
        })
        .catch(err => console.log(err));
    } else {
        Job.findAll({
            where: {
                title: {[OP.like]: '%' + search + '%'}
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .then(jobs => {
            res.render('index', {
                jobs, search
            });
        })
        .catch(err => console.log(err));
    }
});

// view add job
app.get('/add', (req, res) => {
    res.render('add');
});

// view especific job
app.get('/:id', (req, res) => {
    Job.findOne({
        where: {
            id: req.params.id
        }
    })
    .then(job => {
        res.render('view', {
            job
        });
    })
    .catch(err => console.log(err));
});

// jobs routes
app.use('/jobs', require('./routes/jobs'));