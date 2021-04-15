'use strict';
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');

module.exports = function (app) {
  mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });
  
  const ISSUES_SCHEMA = new mongoose.Schema({
    issue_title: {type: String, default: ''},
    issue_text: {type: String, default: ''},
    created_by: {type: String, default: ''},
    assigned_to: {type: String, default: ''},
    status_text: {type: String, default: ''},
    open: {type: Boolean, default: true},
    created_on: {type: Date, default: Date.now},
    updated_on: {type: Date, default: Date.now}
  });

  function model(project) {
    return mongoose.model(project, ISSUES_SCHEMA);
  }

  app.route('/api/issues/:project')
    .get(function (req, res){
      const DATA_MODEL = model(req.params.project);

      DATA_MODEL.find(req.query, (err, data) => {
        if(err) return console.log(err);
        res.json(data);
      });
    })
    // post new
    .post(function (req, res){
      const { issue_title, issue_text, created_by } = req.body;

      if(!issue_title || !issue_text || !created_by){
        console.log({ error: 'required field(s) missing' });
        res.json({ error: 'required field(s) missing' });
      }
      else{
        const DATA_MODEL = model(req.params.project);
        const form = new DATA_MODEL(req.body);
        form.save((err, data) => {
          if(err) return console.log(err);
          res.json(data);
        });
      }
    })
    // edits already posted
    .put(function (req, res){
      if(!req.body._id) {
        console.log({ error: 'missing _id' });
        return res.json({ error: 'missing _id' });
      }

      const emptyFields = Object.entries(req.body).every(([key, val]) => {
        if(key === '_id') return true
        return val === '';
      });

      if(emptyFields) {
        console.log({ error: 'no update field(s) sent', '_id': req.body._id });
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      }

      const DATA_MODEL = model(req.params.project);

      DATA_MODEL.findById(req.body._id, (err, data) => {
        if(err) return console.log(err);
        if(data === null) {
          console.log({ error: 'could not update', '_id': req.body._id });
          return res.json({ error: 'could not update', '_id': req.body._id });
        }
        
        data.issue_title = req.body.issue_title || '';
        data.issue_text = req.body.issue_text || '';
        data.created_by = req.body.created_by || '';
        data.assigned_to = req.body.assigned_to || '';
        data.status_text = req.body.status_text || '';
        data.open = req.body.open === 'false' ? false : true;
        data.updated_on = Date.now();

        data.save((err, form) => {
          if(err) return console.log(err);
          console.log({"result":"successfully updated","_id":req.body._id});
          return res.json({"result":"successfully updated","_id":req.body._id});
        });
      });
    })
    // delete posted
    .delete(function (req, res){
      if(!req.body._id) {
        console.log({ error: 'missing _id' });
        return res.json({ error: 'missing _id' });
      }
      const DATA_MODEL = model(req.params.project);

      DATA_MODEL.findByIdAndDelete(req.body._id, (err, data) => {
        if(err) return console.log(err);
        if(data === null) {
          console.log({ error: 'could not delete', '_id': req.body._id });
          return res.json({ error: 'could not delete', '_id': req.body._id });
        }

        console.log({"result":"successfully deleted","_id":req.body._id});
        return res.json({"result":"successfully deleted","_id":req.body._id});
      });
    });
    
};
