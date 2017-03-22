// CALL PACKAGES ----------
var express         = require('express');
var app             = express();
var path            = require('path');
var mysql           = require('mysql');
var bodyParser      = require('body-parser');

// TEST VARIABLES REMOVE pls.
var user_, password_, hostname_, database_, port_;

//static files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

//project_pool is an array of objects, each project contains host, port, user, pw, db
var project_pool = new Array();

// MILESTONE2 GLOBAL VARIABLES


app.post('/db_info', function(req, res){
	var user_info = JSON.stringify(req.body);
	hostname_ = JSON.parse(user_info).host;
	user_ = JSON.parse(user_info).username;
	password_ = JSON.parse(user_info).dbpassword;
	database_ = JSON.parse(user_info).dbname;
	port_ = JSON.parse(user_info).dbport;
	proj_name_ = JSON.parse(user_info).proj_name;

	var new_project = new Object();

	new_project.proj = proj_name_;
	new_project.host = hostname_;
	new_project.port = port_;
	new_project.user = user_;
	new_project.pw = password_;
	new_project.db = database_;
	project_pool.push(new_project);

	//(jia)I put mysql connection in a function, since it needs those info to create
	//connection,if the process store in global, server will be output errors.
	connection(user_, password_, database_, port_, hostname_);
	
	//redirect to the diagram view
	res.redirect('/diagram.html');
});

app.post('/project_select', function(req, res){

	var proj = JSON.stringify(req.body);
	hostname_ = project_pool[JSON.parse(proj).pnum].host;
	user_ = project_pool[JSON.parse(proj).pnum].user;
	password_ = project_pool[JSON.parse(proj).pnum].pw;
	database_ = project_pool[JSON.parse(proj).pnum].db;
	port_ = project_pool[JSON.parse(proj).pnum].port;

	connection(user_, password_, database_, port_, hostname_);

	res.redirect('/diagram.html');
});
app.post('/project_delete', function(req, res){

	var proj = JSON.stringify(req.body);
	project_pool.splice(JSON.parse(proj).del, 1);


	res.redirect('/');
});
app.post('/project_rename', function(req, res){
	var proj = JSON.stringify(req.body);
	newName = JSON.parse(proj).new_name;
	currentName = JSON.parse(proj).current_name;
	for(i in project_pool){
		if(currentName === project_pool[i].proj){
			project_pool[i].proj = newName;
		}
	}
	res.redirect('/');
});

app.get('/projects', function(req, res) {
    res.status(200).send(project_pool);
});


var conn;
function connection(a, b, c, d, e){
	conn = mysql.createConnection({
		host:     hostname_,
		user:     user_,
		password: password_,//guest
		port: port_,
		database: database_
	});
	conn.on('error', function(err) {
		console.log('Closing MYSQL connection due to error, please restart:')
		console.log(err.code);
		conn.end();
	});
}

// send index.html to user
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/data', function(req, res){
	var sqlData = {'node': [], 'link': []};
	if(typeof database_ !== 'undefined'){
		getresult(database_, function(node_res){

		sqlData.node = node_res;
		for (el in sqlData.node){
			for(item in el.items){
				item.figure = "Decision";
				item.color="purple";
			}
		}

		get_linkDataArray(database_, function(linkData){
			// console.log(linkData);
			//selectively populate linkData
			for(var i in linkData){
				var link_d = {
					'from': linkData[i].TABLE_NAME,
					'to': linkData[i].REFERENCED_TABLE_NAME
				};
				sqlData.link.push(link_d);
			}

			// Step1(sqlData.node);
			// var res_li = OrderAscPk(sqlData.node);

			//stringify the nodes-strings pair
			sqlData = JSON.stringify(sqlData);		

			res.status(200).send(sqlData);
		});
	});
	}else{
	}
});

var test;//to know where to end the callback func

function get_linkDataArray(arg, callback){
	conn.query('select TABLE_NAME, REFERENCED_TABLE_NAME from information_schema.referential_constraints where constraint_schema=?', arg, function(error, results, fields){
		callback(results);
	});
}

function getresult(arg, callback){
		var dataArray = new Array();//this array to store all tables
		mergefunc(database_, function(arg1, arg2, arg3, count){
		// console.log("  1: "+arg1+" 2: "+arg2+" 3: "+arg3+"count: "+count);

		if(dataArray.length === 0){
			var newtable = new Object();
			newtable.key = arg1;

			newtable.items = new Array();
			var newCol = new Object();
			newCol.name = arg2;
			newCol.iskey = arg3;
			newtable.items.push(newCol);
			dataArray.push(newtable);
			if(count === test){
				callback(dataArray);
			}
		}else{
			var i = 0;
			while(i < dataArray.length){
				if(dataArray[i].key === arg1){
					//already have table, create new column
					var newCol = new Object();
					newCol.name = arg2;
					newCol.iskey = arg3;
					dataArray[i].items.push(newCol);
					if(count === test){
						callback(dataArray);
					}
					break;
				}else{
					i++;
					if(i === dataArray.length){
						//no table, create new table
						var newtable = new Object();
						newtable.key = arg1;
						var newCol = new Object();
						newCol.name = arg2;
						newCol.iskey = arg3;
						newtable.items = new Array();
						newtable.items.push(newCol);
						dataArray.push(newtable);
						if(count === test){
							callback(dataArray);
						}
						break;
					}
				}
			}
		}

	});
}
function mergefunc(arg, callback){
	func1(arg, function(arg1){
		func2(arg1, function(arg2, count){
			func3(arg2, function(arg3){
				callback(arg1, arg2, arg3, count);
			})
		})

	})
}
//get table name
function func1(arg, callback){
	conn.query('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?', arg, function(error, results, fields){
		if (error) throw error;

		for(var i in results){
			callback(results[i].TABLE_NAME);
		}
	});

}
//get column name
var count = 0;
function func2(arg, callback){
	conn.query('select column_name as name from information_schema.COLUMNS where table_name=?', [arg], function(error, results, fields){
	if(error) throw error;
		for(var i in results){
			count++;
			// console.log("142: "+count);
			test = count;
			callback(results[i].name, count);
		}

	});
}
//identify iskey
function func3(arg, callback){
	conn.query('SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE where COLUMN_NAME = ?', [arg], function(error, results, fields){
		if(error){
			throw error;
		}
		else if(results.length != 0){
			temp_key = 1;
			callback(temp_key);
		}else{
			temp_key = 0;
			callback(temp_key);
		}
	});
}

function Step1(rels){

	var disjoint, //boolean
		nes, //int
		nas, //int
		ordered_rels = [], //list of relations
		cluster = [], //list of set of relation
		remaining_rels = [];//Set of Relations

	remaining_rels = rels;
	OrderAscPk(rels);
	ordered_rels = rels;

	//insert ordered_rels[1] into cluster[1]
	cluster[0] = ordered_rels[0];

	//remove ordered_rels[1] from remaining_rels
	for(var i = 0; i < remaining_rels.length; i++){
		if(remaining_rels[i].key === ordered_rels[1].key){
			remaining_rels.splice(i, 1);
			i = i - 1;
		}
	}

	nes = 1;
	for(var i = 1; i < ordered_rels.length; i++){
		var R = ordered_rels[i];
		if(R.key = ordered_rels[i - 1].key){
			//insert R into cluster[nes]
			cluster.push(R);
			//remove R from remaining_rels
			for(var j = 0; j < remaining_rels.length; j++){
				if(R.key === remaining_rels[j]){
					remaining_rels.splice(j, 1);
					j = j - 1;
				}else{
					disjoint = true;
					for(j = 0; j < nes; j++){
						if(cluster[j].key === R.key){
							disjoint = false;
						}
					}
				}
			}
			if (disjoint){
				nes = nes + 1;
				//insert R into cluster[nes]
				cluster.splice(nes, 0, R);
				//remove R from remaining_rels
				for(var j = 0; j < remaining_rels.length; j++){
					if(remaining_rels[j].key === R.key){
						remaining_rels.splice(j, 1);
						j = j - 1;
					}
				}
			}
		}
	}
}

function cluster_algorithm(ordered_rels, remaining_rels, cluster, nes){

}
function OrderAscPk__no(S){
	var ordered_li = [];
	for(var item=0; item< S.length; item++){
	    /*push item from S */
	    ordered_li.push(S[item]);
	    
	    /*compare primary key alphbetically and swap*/
	    for(var i = ordered_li.length-1; i>0;i--){
	      
	      var end_loop = 0;  
	      var j=0;
	      /*There is a list of primary keys which is possible to compare several elements*/
	      for(;;){
	      	console.log(ordered_li);
	      	console.log(ordered_li[i]);
	        if(ordered_li[i][Object.keys(ordered_li[i])][j] > ordered_li[i-1][Object.keys(ordered_li[i-1])][j]){
	          end_loop = 1;
	          break;
	        }else if(ordered_li[i][Object.keys(ordered_li[i])][j] < ordered_li[i-1][Object.keys(ordered_li[i-1])][j]){
	          var temp = ordered_li[i-1];
	          ordered_li[i-1]=ordered_li[i];
	          ordered_li[i] = temp;
	          break;
	        }else{
	          if(j==ordered_li[i-1][Object.keys(ordered_li[i-1])].length-1){
	            end_loop = 1;
	            break;
	          }else if(j==ordered_li[i][Object.keys(ordered_li[i])].length-1){
	            var temp = ordered_li[i-1];
	            ordered_li[i-1]=ordered_li[i];
	            ordered_li[i] = temp;
	            break;
	          }else{
	            j++;
	            continue;
	          }
	        }
	        j++;
	      }    
	      if(end_loop == 1){
	        break;
	      }
	    }
  }
  S = ordered_li;
  console.log(S);
  // return [ordered_li,S];
}
//given a set of relations S, return a list with the relations ordered
function OrderAscPk(S){
	// sqlData_new is an object to store sorted entities and relations
	// var sqlData_new = {'node': [], 'link': []};
	// sqlData_new.link = S.link;//link same as before
	// var sqlData_new.node = [];
	var table_name_arr = new Array();
	var table_unsortedname_arr = new Array();

	//S is an object of node and links, S.node is an array of objects, it contains all tables and keys in a db.
	for(var i = 0; i < S.length; i++){	

		table_name_arr.push(S[i].key);

		// var nonKeyNameArr = new Array();
		var new_node = {'key':'', 'items': []};
		new_node.key = S[i].key;

		//in each S.node, it contains key and items, key is the name of table, items are columns
		var keyNameArr = new Array();
		for(var j = 0 ; j < S[i].items.length; j++){
			// filter keys in a table through if condition
			if(S[i].items[j].iskey == 1){
				keyNameArr.push(S[i].items[j].name);
			}
			// else{
			// 	nonKeyNameArr.push(S[i].items[j].name);
			// }
		}
		//1. ascending order regarding the cardinality of the prinmary keys
		keyNameArr.sort();
		// nonKeyNameArr.sort();//I'm not sure, it might not needed for relations

		//assign sorted keys into S
		for(var k = 0; k < keyNameArr.length; k++){
			var temp_obj = new Object();
			temp_obj.name = keyNameArr[k];
			temp_obj.iskey = 1;
			new_node.items.push(temp_obj);
		}
		table_unsortedname_arr.push(new_node);

		//I'm not sure, it might not needed for relations
		// for(var a = 0; a < nonKeyNameArr.length; a++){
		// 	var temp_obj = new Object();
		// 	temp_obj.name = keyNameArr[a];
		// 	temp_obj.iskey = 0;
		// 	new_node.items.push(temp_obj);
		// }
	}

	
	table_name_arr.sort();

	var new_S = new Array();
	for(var a = 0; a < table_name_arr.length; a++){
		for(var b = 0; b < table_unsortedname_arr.length; b++){
			if(table_name_arr[a] === table_unsortedname_arr[b].key){
				new_S.push(table_unsortedname_arr[b]);
			}
		}
	}
	// console.log(new_S);
	S = new_S;

}
// BASIC PAGES -------------------
var basicRouter = express.Router();

// ADMIN PAGES -------------
var adminRouter = express.Router();             // admin page routing

// admin main page
adminRouter.get('/', function(req, res) {
    res.send('ADMIN MAIN PAGE');
});

// route middleware
adminRouter.use(function (req, res, next) {

    // log requests to console
    console.log(req.method, req.url);

    // continue
    next();
});

// apply routes
app.use('/', basicRouter);
app.use('/admin', adminRouter);

// START THE SERVER --------------------
app.listen(1337);
console.log('Port number is 1337.');
