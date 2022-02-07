const config = require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const path = require('path')
const Op = Sequelize.Op
const cors = require('cors')
let sequelize

if (process.env.MODE === 'development') {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: 'sample.db',
        define: {
            timestamps: false
        }
    })
} else {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    })
}

const JobPosting = sequelize.define('jobPosting', {
    description: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            is: '.{3,}'
        }
    },
    deadline: Sequelize.DATEONLY
})

const Candidate = sequelize.define('candidate', {
    name: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            is: '.{5,}'
        }
    },
    cv: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            is: '.{100,}'
        }
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    }
})

JobPosting.hasMany(Candidate)

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(path.resolve(), 'public')))

app.get('/sync', async(req, res) => {
    try {
        await sequelize.sync({ force: true })
        res.status(201).json({ message: 'created' })
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.get('/jobpostings', async(req, res) => {
    try {
        const query = {}
        let pageSize = 2
        const allowedFilters = ['description', 'deadline']
        const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
        if (filterKeys.length > 0) {
            query.where = {}
            for (const key of filterKeys) {
                query.where[key] = {
                    [Op.like]: `%${req.query[key]}%`
                }
            }
        }

        const sortField = req.query.sortField
        let sortOrder = 'ASC'
        if (req.query.sortOrder && req.query.sortOrder === '-1') {
            sortOrder = 'DESC'
        }

        if (req.query.pageSize) {
            pageSize = parseInt(req.query.pageSize)
        }

        if (sortField) {
            query.order = [
                [sortField, sortOrder]
            ]
        }

        if (!isNaN(parseInt(req.query.page))) {
            query.limit = pageSize
            query.offset = pageSize * parseInt(req.query.page)
        }

        const records = await JobPosting.findAll(query)
        const count = await JobPosting.count()
        res.status(200).json({ records, count })
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.post('/jobpostings', async(req, res) => {
    try {
        if (req.query.bulk && req.query.bulk === 'on') {
            await JobPosting.bulkCreate(req.body)
            res.status(201).json({ message: 'created' })
        } else {
            await JobPosting.create(req.body)
            res.status(201).json({ message: 'created' })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.get('/jobpostings/:id', async(req, res) => {
    try {
        const jobPosting = await JobPosting.findByPk(req.params.id)
        if (jobPosting) {
            res.status(200).json(jobPosting)
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.put('/jobpostings/:id', async(req, res) => {
    try {
        const jobPosting = await JobPosting.findByPk(req.params.id)
        if (jobPosting) {
            await jobPosting.update(req.body, { fields: ['description', 'deadline'] })
            res.status(202).json({ message: 'accepted' })
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.delete('/jobpostings/:id', async(req, res) => {
    try {
        const jobPosting = await JobPosting.findByPk(req.params.id, { include: Candidate })
        if (jobPosting) {
            await jobPosting.destroy()
            res.status(202).json({ message: 'accepted' })
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})



app.get('/jobpostings/:jid/candidates', async(req, res) => {
    try {
        const jobPosting = await JobPosting.findByPk(req.params.jid)
        if (jobPosting) {
            const candidates = await jobPosting.getCandidates()

            res.status(200).json(candidates)
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.get('/jobpostings/:jid/:candidates/cid', async(req, res) => {
    try {
        const jobPosting = await JobPosting.findByPk(req.params.jid)
        if (jobPosting) {
            const candidates = await jobPosting.getCandidates({ where: { id: req.params.cid } })
            res.status(200).json(candidates.shift())
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.post('/jobpostings/:jid/candidates', async(req, res) => {
    try {
        const jobPosting = await JobPosting.findByPk(req.params.jid)
        if (jobPosting) {
            const candidate = req.body
            candidate.jobPostingId = jobPosting.id
            console.warn(candidate)
            await Candidate.create(candidate)
            res.status(201).json({ message: 'created' })
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.put('/jobpostings/:jid/candidates/:cid', async(req, res) => {
    try {
        const jobPosting = await JobPosting.findByPk(req.params.jid)
        if (jobPosting) {
            const candidates = await jobPosting.getCandidates({ where: { id: req.params.cid } })
            const candidate = candidates.shift()
            if (candidate) {
                await candidate.update(req.body)
                res.status(202).json({ message: 'accepted' })
            } else {
                res.status(404).json({ message: 'not found' })
            }
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.delete('/jobpostings/:jid/candidates/:cid', async(req, res) => {
    try {
        const jobPosting = await JobPosting.findByPk(req.params.jid)
        if (jobPosting) {
            const candidates = await jobPosting.getCandidates({ where: { id: req.params.cid } })
            const candidate = candidates.shift()
            if (candidate) {
                await candidate.destroy(req.body)
                res.status(202).json({ message: 'accepted' })
            } else {
                res.status(404).json({ message: 'not found' })
            }
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.listen(process.env.PORT, async() => {
    await sequelize.sync({ alter: true })
})