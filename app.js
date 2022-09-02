//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();
const _ =require("lodash")

mongoose.connect("mongodb+srv://s8602412000:YEAH791229@cluster0.ksq9f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology: true});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


const itemSchema= mongoose.Schema({
  name:String
})

const Item=mongoose.model("Item",itemSchema)

const ListSchema={
  name:String,
  ite:[itemSchema]}

const List=mongoose.model("List",ListSchema);


const item1= new Item({name:"please keep track of your health condition for the following fourteen days, use http://localhost:3000/+ your name to update any discomfort you may feel in the near future, we will monitor your data closely, thanks"})


const defaultitem=[item1]

app.get("/", function(req, res) {

  Item.find({},function(err,result){
    if (result.length === 0){
      Item.insertMany(defaultitem,function(err){
      if(err){console.log("error")}
      else{console.log("success!")}
      })
      res.redirect("/");
    }
    else{res.render("list", {listTitle: "instruction", newListItems: result})}
  })})

// const day = date.getDate();







app.post("/delete", function(req, res){

  const checkeditem= req.body.checkbox
  const listName=req.body.listName

  if(listName==="instruction"){Item.findByIdAndRemove(checkeditem,function(err){
    if(!err){
      console.log("success!")
      res.redirect("/")}
  })
  }

  else{
    List.findOneAndUpdate({name:listName},
    {$pull:{ite:{_id:checkeditem}}},function(err,foundList){
    if(!err){

      res.redirect("/"+listName)}
  })}



});


app.get("/:customlist",function(req,res){
  const customlist= _.capitalize(req.params.customlist)

List.findOne({name:customlist}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list= new List({
        name: customlist,
        ite: defaultitem
      })
      list.save()
      res.redirect("/"+customlist)}
      else{
        res.render("list",{listTitle:foundList.name, newListItems:foundList.ite})
      }
    }
    })



})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list
  const item= new Item({name:itemName})

  if(listName==="today"){
  item.save()
  res.redirect("/")}
  else{
    List.findOne({name:listName}, function(err,foundList){

    foundList.ite.push(item);
    foundList.save();
    res.redirect("/"+listName)
  })

  }


});

app.get("/about", function(req, res){
  res.render("about");
});
// process.env.PORT
app.listen( 3000, function() {
  console.log("Server started on port 3000");
});
