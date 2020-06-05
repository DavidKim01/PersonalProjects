const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const credentials = require('./auth/credentials.json');
const querystring = require('querystring');

const server_address = 'localhost';
const port = 3000;
const authentication_cache = './auth/authentication-res.json';
const search_results_cache_dir = './search-results-cache/'; //used later for search_results_cache implementation

const request_authentication = function (user_input, res){
	//Note: credentials are imported via a file import on line 5 to avoid hard coding them into our index.js like below (now commented out):
	// let post_data = querystring.stringify({
	// 	"client_id": "1",
	// 	"client_secret": "1",
	// 	"grant_type": "client_credentials"
	// });

	let post_data = querystring.stringify(credentials);

	const options = {
		'method':"POST",
		'headers':{
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': post_data.length
		}
	}
	
	console.log("Requesting Token");

	let cache_valid = false;
	if (fs.existsSync(authentication_cache)) {
		cached_auth = require(authentication_cache); //since the authentication_cache.json file exists we can now import it.
		if (new Date(cached_auth.expiration) > Date.now()) { //if the token property expiration has not yet passed the current time/date...
			cache_valid = true; //it has not yet expired, so set the cache validity to true. The cache is still fresh enough (it is less than an hour old.)
		}
		else { //Otherwise the token has expired and leave the cache_valid variable at false, denoting that it has expired.
			console.log('Token Expired');
		}
	}
	
	if (cache_valid){
		create_search_req(cached_auth, user_input, res);
	}

	else {
		const token_endpoint = 'https://accounts.spotify.com/api/token';
		let auth_sent_time = new Date();
		let authentication_req = https.request(token_endpoint, options, function (authentication_res) {
			received_authentication(authentication_res, user_input, auth_sent_time, res);
			//console.log("CALLBACK CHECK for CACHE functionality: New Request Caught for authentication cache!"); //testing purposes
		});
		
		authentication_req.on('error', function (e) {console.error(e);});
		authentication_req.end(post_data);
	}
}

const received_authentication = function(authentication_res, user_input, auth_sent_time, res){
	authentication_res.setEncoding("utf8");
	let body = "";
	authentication_res.on("data", function (chunk){body += chunk;});
	authentication_res.on("end", function (){
		let spotify_auth = JSON.parse(body);
		spotify_auth.expiration = auth_sent_time.getTime() + 3600000;
		create_access_token_cache(spotify_auth);
		create_search_req(spotify_auth, user_input, res);
	});
};


const connection_established = function(req, res){
	console.log(`request was made: ${req.url}`);

	if (req.url === "/"){
		let html_stream = fs.createReadStream('./html/search-form.html');
		res.writeHead(200, {'Content-Type':'text/html'});
		html_stream.pipe(res);
	}
	else if (req.url.startsWith("/album-art/")){
		let image_stream = fs.createReadStream(`.${req.url}`);
		//Note: on() methods are asynchronouse, so we are asynchronously catching errors where the file does not exist on the server/folder
		image_stream.on('error', function(err) {
		 	console.log(err);
		 	res.writeHead(404);
		 	return res.end();
		 });

		res.writeHead(200, {'Content-Type':'image/jpeg'});
		image_stream.pipe(res);
	}
	else if (req.url.startsWith("/search")){
		let user_input = url.parse(req.url,true).query.q; //setting user_input as the return value of the parse method, 
		//with the 2nd parseQueryString set to true in order for an object to be returned containing a string of the search term as 
		//opposed to returning the actual url query string itself(?q= and all).
		request_authentication(user_input, res);
		res.writeHead(200,{'Content-Type':'text/html'});
	}
	else {
		//If we had a dedicated 404 page we could specify {'Content-Type':'text/html'} in the writeHead(404, {...})
		//Note: This will catch favicon requests as well, and write 404's to the response.
		res.writeHead(404);
		res.end();
	}
};

const create_access_token_cache = function (spotify_auth){
	let data = JSON.stringify(spotify_auth);
	fs.writeFile(authentication_cache, data, (err) => {
		if(err) throw err;
	});
};
const create_search_req = function(spotify_auth, user_input, res){
	console.log("Requesting Search");
	//Sanitizing the input for cases where the input may contain illegal file name characters such as slashes when searching for AC/DC
	let sanitized_input = user_input.replace(/\//g,'_');
	sanitized_input = sanitized_input.replace(/\\/g,'_');
	let search_cache_file = `${search_results_cache_dir}${sanitized_input}-search_results_cache.json`;
	let cache_valid = false;

	if (fs.existsSync(search_cache_file)) {
		cached_search = require(search_cache_file); 
		let file_stats = fs.statSync(search_cache_file); //statSync will return an object containing various statistics about a file.
		let old = file_stats.birthtimeMs + 3600000; //birthtime checks when the file was created.
		//currently the search_results_cache is deemed to be dirty if the file is more than an hour old since it first was created.
		let now = Date.now(); 
		if (now <= old) { 
			cache_valid = true; 
		}
		else {
			console.log('Search results out of date...');
		}
	}
	
	if (cache_valid){
		download_art(cached_search, user_input, res);
	}

	else {
		console.log(spotify_auth);
		const request_endpoint = `https://api.spotify.com/v1/search?type=album&q=${user_input}&access_token=${spotify_auth.access_token}`;
		let search_req = https.get(request_endpoint, function(album_art_res) {
			get_album_data(album_art_res, user_input, res);
			//console.log("CALLBACK CHECK for CACHE functionality: New Request Caught for search cache!"); //testing purposes
		});
		
		search_req.on('error', function (e) {console.error(e);});
		search_req.end(); 
	}
};

const get_album_data = function (album_art_res, user_input, res) {
	album_art_res.setEncoding("utf8");
	let body = "";
	album_art_res.on("data", function (chunk){body += chunk;});
	album_art_res.on("end", function (){
		let search_data = JSON.parse(body);
		create_search_results_cache(search_data, user_input);
		download_art(search_data, user_input, res);
	});
}

const create_search_results_cache =  function (search_data, user_input){
	//Sanitizing the input for cases where the input may contain illegal file name characters such as slashes when searching for AC/DC
	let sanitized_input = user_input.replace(/\//g,'_');
	sanitized_input = sanitized_input.replace(/\\/g,'_');
	let data = JSON.stringify(search_data);
	fs.writeFile(`${search_results_cache_dir}${sanitized_input}-search_results_cache.json`, data, (err) => {
		if(err) throw err;
	});
}
const download_art= function(search_data, user_input, res){
	let downloaded_images = 0;
	let album_objects = search_data.albums.items;
	let albums = album_objects.length;

	console.log("Downloading Images");
	image_paths_array = [];
	for (let i = 0; i < albums; i++){
		let img_url = search_data.albums.items[i].images[0].url;
		let current_img = img_url.slice(24);
		let img_path = `./album-art/${current_img}.jpeg`;
		image_paths_array[i] = img_path;

		fs.access(img_path, function(err){
			if(err){
				let image_req = https.get(img_url, function(image_res){
					//console.log("CALLBACK CHECK for CACHE functionality: New Request Caught for img cache!"); ////testing purposes
					let new_img = fs.createWriteStream(img_path, {'encoding':null});
					image_res.pipe(new_img);
					new_img.on("finish", function() {
						downloaded_images++;
						if(downloaded_images === albums){
							generate_webpage(user_input, image_paths_array, res);
						}
					});
				});
				image_req.on('error', function(err){console.log(err);});
				//console.log("Requesting a new image(not found in cache)...");
				image_req.end();
			}
			else{
				//console.log("Cache Hit: File found!");
				downloaded_images++;
				if(downloaded_images === albums){
					generate_webpage(user_input, image_paths_array, res);
				}
			}
		});//end access	
	}//end for-loop
}
const generate_webpage = function(user_input, image_paths_array, res){
	//console.log("Done fetching art!");
	results = `<h1>Search Results ${user_input}<h1>`;
	img_tagged_array = image_paths_array.map(function(x) { //this map function will attach the <img> tags appropriately to each url path in the image_paths_array
		return `<img src="${x}" />`;
	});

	results += img_tagged_array.join(''); //this join function will then combine all the <img> tagged filenames
	res.end(results);
}

const connectionStart = function(){
	console.log(`Now Listening on Port ${port}`);
};

const server = http.createServer(connection_established);

server.on("listening", connectionStart);
server.listen(3000, server_address);
