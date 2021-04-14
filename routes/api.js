'use strict';
const ObjectId = require('mongodb').ObjectId;
const myDB = require('../connection.js');

module.exports = function (app) {

  app.route('/api/issues/:project')
  /* You can send a GET request to /api/issues/{projectname} and filter the request by also passing along any field and value as a URL query (ie. /api/issues/{project}?open=false). You can pass one or more field/value pairs at once. */
    .get(function (req, res){
      myDB(async client => {
        const myDataBase = await client.db('issues').collection(req.params.project);

        myDataBase.find().toArray()
          .then(issues => {
            console.log(req.query);
            const keys = Object.keys(req.query);
            if(keys.length === 0) {
              // console.log(issues);
              res.json(issues);
            }
            else {
              for(let key of keys){
                if(key == 'created_on' || key == 'updated_on') req.query[key] = new Date(req.query[key]);
                if(key == 'open') req.query[key] = req.query[key] == 'true' ? true : false;
              }
              // console.log( issues.filter(issue => keys.every(key => issue[key] == req.query[key])) );
              res.json( issues.filter(issue => keys.every(key => issue[key] == req.query[key])) );
            }
          });
      });
    })
    // post new
    .post(function (req, res){
      myDB(async client => {
        const myDataBase = await client.db('issues').collection(req.params.project);

        const {
          issue_title,
          issue_text,
          created_by,
          assigned_to = '',
          status_text = '',
          open = true,
          created_on = new Date(),
          updated_on = new Date() } = req.body;

        if(!issue_title || !issue_text || !created_by) res.json({ error: 'required field(s) missing' });
        else{
          myDataBase.insertOne({ issue_title, issue_text, created_by, assigned_to, status_text, open, created_on, updated_on }, (err, doc) => {
            if(err) console.log(err);
            else {
              // console.log(doc.ops[0]);
              res.json(doc.ops[0]);
            }
          });
        }
        
      });
    })
    // edits already posted
    /* When the PUT request sent to /api/issues/{projectname} does not include update fields, the return value is { error: 'no update field(s) sent', '_id': _id }. On any other error, the return value is { error: 'could not update', '_id': _id }. */
    .put(function (req, res){
      // console.log(req.body);
      myDB(async client => {
        if(!req.body._id) {
          // console.log({ error: 'missing _id' });
          res.json({ error: 'missing _id' });
          return;
        }

        const myDataBase = await client.db('issues').collection(req.params.project);
        myDataBase.findOne({ _id: new ObjectId(req.body._id) }, (err, issue) => {
          if(issue){
            const cloneBody = Object.assign({}, req.body);
            delete cloneBody._id;

            // console.log('this is clone');
            // console.log(cloneBody);
            if(Object.values(cloneBody).every(value => value === '')) {
              // console.log({ error: 'no update field(s) sent', '_id': req.body._id });
              res.json({ error: 'no update field(s) sent', '_id': req.body._id });
              return;
            }

            for(let [key,val] of Object.entries(req.body)){
              req.body[key] = val === '' ? undefined : val;
            }
            
            const {
              issue_title = issue.issue_title,
              issue_text = issue.issue_text,
              created_by = issue.created_by,
              assigned_to = issue.assigned_to,
              status_text = issue.status_text } = req.body;
            const updated_on = new Date();

            let open = true;
            if(req.body.open === 'false') open = false;

            // console.log({
            //   issue_title, issue_text, created_by, assigned_to, status_text, open, updated_on
            // });

            myDataBase.updateOne(issue, { $set: {issue_title, issue_text, created_by, assigned_to, status_text, open, updated_on} });

            // console.log({"result":"successfully updated","_id":req.body._id});
            res.json({"result":"successfully updated","_id":req.body._id});
          }
          else {
            // console.log({ error: 'could not update', '_id': req.body._id });
            res.json({ error: 'could not update', '_id': req.body._id });
          }
        });
      });
    })
    // delete posted
    .delete(function (req, res){
      myDB(async client => {
        if(!req.body._id) {
          // console.log({ error: 'missing _id' });
          res.json({ error: 'missing _id' });
          return;
        }
        const myDataBase = await client.db('issues').collection(req.params.project);
        myDataBase.deleteOne({ _id: new ObjectId(req.body._id) }, (err, doc) => {
          if(err) console.log(err);
          else if(doc.deletedCount !== 1){
            // console.log({ error: 'could not delete', '_id': req.body._id });
            res.json({ error: 'could not delete', '_id': req.body._id });
          }
          else {
            // console.log({"result":"successfully deleted","_id":req.body._id});
            res.json({"result":"successfully deleted","_id":req.body._id});
          }
        });
      });
    });
    
};
