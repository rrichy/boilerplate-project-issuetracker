'use strict';
const ObjectId = require('mongodb').ObjectId;
const myDB = require('../connection.js');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
    })
    // post new
    .post(function (req, res){
      myDB(async client => {
        const myDataBase = await client.db('issues').collection(req.params.project);
        myDataBase.insertOne(Object.assign({}, req.body, {'open': true, 'create_on': new Date(), 'updated_on': new Date()}), (err, doc) => {
          if(err) console.log(err);
          else {
            console.log(doc.ops[0]);
            res.json(doc.ops[0]);
          }
        });
      });
    })
    // edits already posted
    .put(function (req, res){
      // console.log(req.body);
      myDB(async client => {
        const myDataBase = await client.db('issues').collection(req.params.project);
        myDataBase.findOne({ _id: new ObjectId(req.body._id) }, (err, issue) => {
          if(err) console.log(err);
          else if(issue === null) {
            console.log({"error":"could not update","_id":req.body._id});
            res.json({"error":"could not update","_id":req.body._id});
          }
          else{
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

            console.log({"result":"successfully updated","_id":req.body._id});
            res.json({"result":"successfully updated","_id":req.body._id});
          }
        });
      });
    })
    // delete posted
    .delete(function (req, res){
      myDB(async client => {
        const myDataBase = await client.db('issues').collection(req.params.project);
        myDataBase.deleteOne({ _id: new ObjectId(req.body._id) }, (err, doc) => {
          if(err) console.log(err);
          else if(doc.deletedCount !== 1){
            console.log({"error":"could not delete","_id":req.body._id});
            res.json({"error":"could not delete","_id":req.body._id});
          }
          else {
            console.log({"result":"successfully deleted","_id":req.body._id});
            res.json({"result":"successfully deleted","_id":req.body._id});
          }
        });
      });
    });
    
};
