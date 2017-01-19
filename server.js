var express=require('express');
var app=express();
var mongojs=require('mongojs');
var db = mongojs('mongodb://admin:admin@ds117859.mlab.com:17859/heroku_zz1qkv7p', ['ecommerce'])

/*var orders=mongojs('mongodb://userM4I:M6IXpRnUqFVowXca@ecommerce',['userOrders']);
var featured=mongojs('mongodb://userM4I:M6IXpRnUqFVowXca@ecommerce',['featureProd']);
var userprod=mongojs('mongodb://userM4I:M6IXpRnUqFVowXca@ecommerce',['userProducts']);
var users=mongojs('mongodb://userM4I:M6IXpRnUqFVowXca@ecommerce',['userDetails']);
var wishlist=mongojs('mongodb://userM4I:M6IXpRnUqFVowXca@ecommerce',['wishlistProducts']);*/
var bodyParser=require('body-parser'); 

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.listen(process.env.PORT);

console.log("server running on port 8080");

var session = require('express-session');

app.set('trust proxy', 1) // trust first proxy 
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true }
}))




app.post('/featureProd',function(req,res){
	console.log("iam in nginit server");
	var collection = featured.collection('featureProd');
	collection.find(function(err,doc)
					{
		if(err){
			return;
		}
		else{
			res.json(doc);
			console.log("from init server");         
		}
	});

});




app.post('/ecommerce',function(req,res){

	console.log("iam in server control");
	var collection=db.collection('ecommerce');

	console.log(req.body);
	collection.find(req.body,function(err,doc)
					{

		if(err)
		{
			return;
		}
		else
		{
			res.json(doc);
			console.log("From server.js post");
			console.log(req.body);
		}
	});
});



app.post('/userDetails', function (req, res) {
	console.log("from server userDetails");

	var sessionDetails=[];
	var sid = req.sessionID;
	var sess = req.session;
	sessionDetails.push(sid);
	sessionDetails.push(sess);

	console.log(req.body);
	var collection=users.collection('userDetails');
	var document = {"firstname":req.body.firstname, "secondname":req.body.secondname,"password":req.body.password,"emailid":req.body.emailid,"phone":req.body.phone,"address":req.body.address};

	collection.findOne({'emailid':req.body.emailid},function(error,exist){
		if(exist && !error){
			console.log("User already exists");
			console.log(req.body.emailid);
			collection.find({'emailid':req.body.emailid},function(err,doc){
				console.log(doc);
				sessionDetails.push(doc);
				sessionDetails.push("OldUser");
				res.json(sessionDetails);
			});
		}
		else{
			console.log("user not found");
			console.log(document);
			if(document.firstname==undefined){
				console.log("firstname not found");
				res.json(null);
			}
			else{

				collection.insert(document,function(err,doc){
					if(err)
						console.log(err);
					else
					{
						console.log("item inserted");
						sessionDetails.push(doc);
						sessionDetails.push("NewUser")
						res.json(sessionDetails);

					}

				});
			}



			console.log("from server.js userDetails");
		}

	})


});






app.post('/getAddress',function(req,res){

	console.log(req.body);

	var collection=users.collection('userDetails');

	collection.find({'emailid':req.body.emailid},{'address':1},function(err,doc){


		if(err)
		{
			return;
		}
		else
		{
			res.json(doc);
			console.log(doc);
			console.log("address sent");

		}



	});



});


app.post('/userProducts',function(req,res){
	console.log("inside userProducts");
	console.log(req.body);
	console.log(req.body.length);
	var collection=orders.collection('userOrders');
	var collection1=db.collection('ecommerce');
	// var document = {"emailid":req.body[0],"products":req.body[1]};

	collection.find({'emailid':req.body[0]},function(error,exist){
		if(exist && !error){
			console.log("user found");

			for(var i=0;i<req.body.length;i++){
				console.log("inside for loop userProducts");
				console.log(req.body[i]);
				var tempName=req.body[i].name;
				console.log(tempName);
				var tempCount=req.body[i].count;
				console.log(tempCount);
				collection1.find({'name':req.body[i].name},{'quantity':1,'name':1},function(err,doc){
					if(!err){
						console.log(doc[0].quantity);
						console.log("for loop qunatoty update");
						console.log(doc[0].name);
						console.log(doc[0].quantity-tempCount);
						collection1.update({'name':doc[0].name},{$set:{'quantity':doc[0].quantity-tempCount}},function(err,doc){
							console.log("modified");
							console.log(doc);


						});

					}
					else{
						console.log("not found");
						res.send("not found in db");
					}
				});
			}
			res.send("updated in db");

		}

	});


});





app.post('/insert',function(req,res){
	console.log(req.body);
	console.log(req.body[1].length);
	var collection=orders.collection('userOrders');
	var document = {"emailid":req.body[0],"products":req.body[1]};

	collection.insert(document,function(err,docs){



		if(err){
			console.log(err);
		}
		else{

			res.send("inserted into previous orders");

		}

	})   
});

app.post('/insertWishlist',function(req,res){
	console.log(req.body);
	console.log(req.body[1].length);
	var collection=wishlist.collection('wishlistProducts');
	var document = {"emailid":req.body[0],"products":req.body[1]};

    collection.remove({'emailid':req.body[0]},function(err,doc){
        
        console.log("removed from db");
           });
        
     collection.insert(document,function(err,docs){

      console.log("in insert");

		if(err){
			console.log(err);
		}
		else{

			res.send("inserted into wishlist");

		}

	});
            
        
  
});
app.post('/removeWishlist',function(req,res){
	console.log(req.body);
	console.log(req.body[1].length);
	var collection=wishlist.collection('wishlistProducts');
	var document = {"emailid":req.body[0],"products":req.body[1]};

	collection.remove(document,function(err,docs){



		if(err){
			console.log(err);
		}
		else{

			res.send("inserted into wishlist");

		}

	})   
});




app.post('/previousOrders',function(req,res){

	console.log(req.body);

	var collection=orders.collection('userOrders');
	collection.find({'emailid':req.body.emailid},{'products':1},function(err,doc){

		if(err)
		{
			return;
		}
		else
		{
			console.log(doc);
			res.json(doc);
			console.log("sent previous products from server");

		}
	});
});

app.post('/wishlistProducts',function(req,res){

	console.log(req.body);

	var collection=wishlist.collection('wishlistProducts');
	collection.find({'emailid':req.body.emailid},{'products':1},function(err,doc){

		if(err)
		{
			return;
		}
		else
		{
			console.log(doc.length);
			//res.json(doc[doc.length-1]);
            res.json(doc);
			console.log("sent wishlist products from server");

		}
	});
});

