var http = require("http");
var url = require("url");
var fs = require("fs");
var qs = require("querystring");
var swig = require("swig");
var mysql  = require('mysql').createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodejs_satu',
	port		: 3306,
});

var access, access2, match, html= "";
//cara boros
/* var routes = require("routes");
varroute = routes(); */
//cara simpel
var routes = require('routes')();
//menambahkan route dari pathname / dengan fungsi untuk request dan respond
routes.addRoute('/', function(req,res){
	res.writeHead(200, {"Content-Type" : "text/plain"});
		var link = qs.parse(access.query);
		//console.log(link);
		if(req.method == "POST"){
			var isi="";
			req.on('data', function(konten){
			   isi += konten;
		   });
		   req.on('end', function(){
			   var data = qs.parse(isi);
			   mysql.query("insert into mahasiswa set ? ", data, function (error, results, fields) {
					if (error)
						throw error;
					//console.log(results);
					/* results.forEach(function(item){
						
					}); */
					res.writeHead(302, {"Location" : "/mahasiswa"});
					res.end();
				});
				//res.end(JSON.stringify(data)+" \n "+isi);
		   });
		}else{
			res.end(JSON.stringify(link));
		}
});
//menggunakan opsional halaman dengan menggunakan :<namanya>?
routes.addRoute('/about/:nama?/:alamat?', function(req,res){
	console.log(this.params.nama);
	if(this.params.nama != null && this.params.alamat != null){
		res.writeHead(200, {"Content-Type" : "text/plain"});
		res.end("Nama ku "+this.params.nama+"\nAlamat ku di : "+this.params.alamat)
	}else{
		res.writeHead(404, {"Content-Type" : "text/plain"});
		res.end("HALAMAN TIDAK ADA");
	}
});

routes.addRoute('/mahasiswa/:id?/:alamat?', function(req,res){
	
	if(this.params.id != null && this.params.alamat != null){
		console.log(this.params.alamat);
			mysql.query("DELETE FROM mahasiswa WHERE ?", {id : this.params.id}, function (error, results, fields) {
							if(error)
								throw error					
							res.writeHead(302, {"Location" : "/mahasiswa"});
							res.end();
			});
	}else if(this.params.id != null && this.params.alamat == null){
		if(req.method == "POST"){
					var idData = this.params.id;
					var isi="";
					req.on('data', function(konten){
						   isi += konten;
					 });
				   req.on('end', function(){
					   mysql.query("SELECT * FROM mahasiswa WHERE ?", {id : idData}, function (error, results, fields) {
							if(results.length){							
							   var data = qs.parse(isi);
							   mysql.query("update  mahasiswa set ? WHERE ?", 
							   [data, {id : results[0].id}], 
							   function (error, results, fields) {
									res.writeHead(302, {"Location" : "/mahasiswa"});
									res.end();
								});
							}else{
								res.writeHead(404, {"Content-Type" : "text/plain"});
								res.end("ID tidak cocok");
							}
						});
				   });
				}else{
					mysql.query("SELECT * FROM mahasiswa WHERE ?", {id : this.params.id}, function (error, results, fields) {
						if(results.length){
							console.log(results);
							html = swig.compileFile('./app/editdata.html')({
								judul : "Edit Mahasiswa",
								data : results[0],
							});
							res.writeHead(200, {"Content-Type" : "text/html"});
							res.end(html);
						}else{
							res.writeHead(404, {"Content-Type" : "text/plain"});
							res.end("ID tidak cocok");
						}
					});
				}
	}else{
		console.log("kampret");
		mysql.query("SELECT * FROM mahasiswa", function (error, results, fields) {
			if (error)
				throw error;
			//console.log(results);
			/* results.forEach(function(item){
				
			}); */
			html = swig.compileFile('./app/mahasiswa.html')({
				judul : "Data Mahasiswa",
				data : results,
			});
			res.writeHead(200, {"Content-Type" : "text/html"});
			res.end(html);
		});
	}
});
routes.addRoute('/input', function(req,res){
	res.writeHead(200, {"Content-Type" : "text/html"});
	html = swig.compileFile('./app/kirimdata.html')({
		nama : "Muhammad Abdullah Al Muwahhid",
		alamat : "Yogyakarta",
		jurusan : ["TI", "SI", "MI", "TK", "KA"]
	});
	//fs.createReadStream('./app/kirimdata.html').pipe(res);
	res.end(html);
});

http.createServer(function(req, res){
	access = url.parse(req.url);
		access2 = url.parse(req.url).pathname;
		match = routes.match(access2);
		//console.log(match);
		if(match){
			match.fn(req, res);
		}else{
			res.writeHead(404, {"Content-Type" : "text/plain"});
			res.end("halaman tidak ada");
		}
	
	/* var access = url.parse(req.url);
	//console.log(req);
	if(access.pathname != "/favicon.ico" && access.pathname == "/" ){
		res.writeHead(200, {"Content-Type" : "text/plain"});
		//console.log(access);
	}else if(access.pathname == "/kirim"){
	}else{
		res.writeHead(404, {"Content-Type" : "text/plain"});
		res.end("Halaman tidak ada");
	}*/
}).listen(8888);
console.log("lagi jalan");