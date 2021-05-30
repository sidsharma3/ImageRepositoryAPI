require("dotenv").config();  
const cors = require('cors');
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const submissionRoutes = require('../routes/submission');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const categoryRoutes = require('../routes/category');
const tagRoutes = require('../routes/tag');
const formRoutes = require('../routes/form');
const app = express();
let chai = require("chai");
let chaiHttp = require("chai-http");

// Assertion 
chai.should();
chai.use(chaiHttp); 

//Mockgoose creates an empty mock database
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

mockgoose.prepareStorage().then(() => {
    mongoose
    .connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => console.log('DB connected'))
    .catch(err => {
        console.log(err);
    }); 
})

// Setup Cors
if (process.env.NODE_ENV === 'development') {
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

// routes middleware
app.use('/api', submissionRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use('/api', formRoutes);

// setup the port
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

describe('Test API', () => {
    describe("Authentication tests", () => {
        it("It should return submissions", (done) => {
            chai.request(app)
                .get("/api/submissions")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                done();
            });
        });

        it("It should return categories", (done) => {
            chai.request(app)
                .get("/api/categories")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                done();
            });
        });

        it("It should return tags", (done) => {
            chai.request(app)
                .get("/api/tags")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                done();
            });
        });

        it("It should NOT return anything, false route", (done) => {
            chai.request(app)
                .get("/api/submission")
                .end((err, response) => {
                    response.should.have.status(404);
                done();
                });
        });

        it("It should prevent entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .get("/api/user/profile")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(401);
                done();
                });
        });

        it("It should prevent entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .get("/api/user/profile")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(401);
                done();
                });
        });

        it("It should prevent entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .post("/api/submission")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(401);
                done();
                });
        });

        it("It should NOT work but allow entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .post("/api/contact")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(422);
                done();
                });
        });

        it("It should NOT work but allow entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .post("/api/contact-submission-author")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(422);
                done();
                });
        });

        it("It should NOT work but allow entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .post("/api/category")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(422);
                done();
                });
        });

        it("It should NOT work but allow entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .post("/api/tag")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(422);
                done();
                });
        });

        it("It should prevent entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .put("/api/submission/mountains")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(401);
                done();
                });
        });

        it("It should prevent entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .put("/api/user/submission/mountains")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(401);
                done();
                });
        });

        it("It should prevent entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .post("/api/user/submission")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(401);
                done();
                });
        });

        it("It should prevent entry", (done) => {
            const task = {
                completed: false
            };
            chai.request(app)                
                .delete("/api/submission/mountains")
                .send(task)
                .end((err, response) => {
                    response.should.have.status(401);
                done();
                });
        });
    }); 

});

