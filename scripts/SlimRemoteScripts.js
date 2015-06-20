var SlimMediaCenterInit = {
	JSON_RPC: '/jsonrpc',
	playerid: 1,
	playertime: '',
	init: function() {
		SlimMediaCenterInit.getActivePlayer();
		
	},
	setPlayerId: function(id) {
		SlimMediaCenterInit.playerid = id;
	},
	getActivePlayer: function() {
		jQuery.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?GetActivePlayer',
			data: '{ "jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1 }',
			success: jQuery.proxy(function(data) {
				if(data && data.result && data.result[0]) {
					SlimMediaCenterInit.setPlayerId(data.result[0].playerid);
					SlimMediaCenterInit.getCurrentlyPlaying();
					SlimMediaCenterInit.getPlayerProperties();
				} else {
					$('#home-list').children('[data-current-media="divider"]').hide();
					$('#home-list').children('[data-current-media="info"]').hide();

					try {
						$("#home-list").listview('refresh');
					} catch(ex) {}
				}
			}, this),
			dataType: 'json'
		});
	},
	getPlayerProperties: function() {
		jQuery.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?GetPlayerProperties',
			data: '{ "jsonrpc": "2.0", "method": "Player.GetProperties", "params" : { "playerid": ' + SlimMediaCenterInit.playerid + ', "properties": [ "time", "totaltime" ] }, "id": 1 }',
			success: jQuery.proxy(function(data) {
				if(data && data.result && data.result) {
					SlimMediaCenterInit.playertime = '';

					if(data.result.time.hours > 0) {
						SlimMediaCenterInit.playertime += data.result.time.hours + ':';
					}

					SlimMediaCenterInit.playertime += data.result.time.minutes + ':' + SlimMediaCenterUtils.leadingZero(data.result.time.seconds) + ' / ';

					if(data.result.totaltime.hours > 0) {
						SlimMediaCenterInit.playertime += data.result.totaltime.hours + ':';
					}
					
					SlimMediaCenterInit.playertime += data.result.totaltime.minutes + ':' + SlimMediaCenterUtils.leadingZero(data.result.totaltime.seconds);
				}
			}, this),
			dataType: 'json'
		});
	},
	getCurrentlyPlaying: function() {
		jQuery.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?GetCurrentlyPlaying',
			data: '{ "jsonrpc": "2.0", "method": "Player.GetItem", "params": { "playerid": ' + SlimMediaCenterInit.playerid + ', "properties": [ "title", "showtitle", "artist", "thumbnail" ] }, "id": 1 }',
			success: jQuery.proxy(function(data) {
				if(!(data && data.result))
					return;

				if(!$('#home-list li[data-current-media="info"]').is(':visible')) {
					$('#home-list li[data-current-media="info"]').show();
					$('#home-list li[data-current-media="divider"]').show();
				}
			

				$('[data-current-media="title"]').text(data.result.item.title);
				//$('[data-current-media="artist"]').text(data.result.item.artist);
				$('[data-current-media="label"]').text(data.result.item.label);
				$('[data-current-media="player-time"]').text(SlimMediaCenterInit.playertime);
				$('[data-current-media="thumbnail"]').attr('src', '/image/' + encodeURI(data.result.item.thumbnail));

				$('[data-currentlyplaying="info"]').each(function () {


					if(data.result.item) {
						if(SlimMediaCenterInit.playerid == 0) {
							$(this).html('' + data.result.item.title + '<br /><p>' + data.result.item.artist + '</p><br /><p>' + SlimMediaCenterInit.playertime + '</p>');
						} else if(SlimMediaCenterInit.playerid == 1) {
							if(data.result.item.showtitle) {
								$(this).html('<p >' + data.result.item.showtitle + '</p><br />' + data.result.item.title + '<br /><p>' + SlimMediaCenterInit.playertime + '</p>');
							} else {
								$(this).html(data.result.item.title + '<br /><p>' + SlimMediaCenterInit.playertime + '</p>');
							}
						}
					}

					try {
						$("#homelist").listview('refresh');
					} catch(ex) {}
				});
			}, this),
		dataType: 'json'});
	},
	scan: function(library) {
		var data = '';

		if(library == 'Audio') {
			data = '{ "jsonrpc": "2.0", "method": "AudioLibrary.Scan", "id": 1 }';
		} else if(library == 'Video') {
			data = '{ "jsonrpc": "2.0", "method": "VideoLibrary.Scan", "id": 1 }';
		}

		jQuery.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?Scan',
			data: data,
			beforeSend : function(){ 
			var interval = setInterval(function(){
			$.mobile.loading('show',{
            text: 'Updating ...' ,
            textVisible: true,
            theme: 'a',
            textonly: false            
    		});
			clearInterval(interval);
			},1); 
			},
			complete: function(){
			var interval = setInterval(function(){
			$.mobile.loading('hide');
			clearInterval(interval);
			},1); 
			},
			success: jQuery.proxy(function(data) {
				
			}, this),
			dataType: 'json'});
	}		
}
//Utilities
var SlimMediaCenterUtils = {
	split: function(text) {
		var retval = "";

		for(var i = 0; i < text.length; i++) {
			retval += "<li>" + text[i] + "</li>";
		}

		return retval;
	},
	leadingZero: function(number) {
		var s = "0" + number;
		return s.substr(s.length - 2);
	}
}


//SlimRemote
var SlimMediaCenterRemote = {
    isInitialized: false,
	
	init: function() {	
	if(SlimMediaCenterRemote.isInitialized) 
	{
	//console.log("Remote deja initialized");
      return;
	}
	else
	{
	$('[data-remote-action]').on('click', function() {
			SlimMediaCenterRemote.remotePressed($(this).attr('data-remote-action'), $(this).attr('data-remote-params'));
		});
	
	SlimMediaCenterRemote.isInitialized = true;
	}
		
	},
	getVolume: function() {
						
		jQuery.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?GetVolume',
			data: '{ "jsonrpc": "2.0", "method": "Application.GetProperties", "params": { "properties": [ "volume" ] }, "id": 1 }',
			success: jQuery.proxy(function(data) {						
					 $('.dynamic-slider-form').html("");					
					 $( "<input  class='VolSlider' type='number' data-highlight='true' data-type='range' min='0' max='100' step='10' value='"+ data.result.volume +"'>" )
			        .appendTo( ".dynamic-slider-form" )
			        .slider()
			        .textinput();				 				
			}, this),
			dataType: 'json'});
	},
	remotePressed: function(action,params) {
	var data = '';

		if(params == '') {
		//shut down services up down?
			data = '{ "jsonrpc": "2.0", "method": "' + action + '", "id": ' + SlimMediaCenterInit.playerid + ' }';
		} else if(params == 'player') {
			//SlimMediaCenterInit.getActivePlayer();
			//remote  ok play stop
			data = '{ "jsonrpc": "2.0", "method": "' + action + '", "params": { "playerid": '+ SlimMediaCenterInit.playerid +' } }';
		} else if(params == 'TextInputPP') {
			//PP TextToSendPP
			data = '{  "jsonrpc": "2.0", "method": "' + action + '", "params": { "text": "' + $('#TextToSendPP').val() + '" , "done": false },  "id":   '+ SlimMediaCenterInit.playerid +'  }'; 
		} else if(params == 'TextInput') {
			//var TextToSend = $('#TextToSend').val();
			data = '{  "jsonrpc": "2.0", "method": "' + action + '", "params": { "text": "' + $('#TextToSend').val() + '" , "done": false },  "id":   '+ SlimMediaCenterInit.playerid +'   }'; 
		} else if(params == 'VolumeChangeToThis') {			
			data = '{ "jsonrpc": "2.0", "method": "Application.SetVolume", "params": { "volume": ' + action + ' }, "id":  '+ SlimMediaCenterInit.playerid +' }';			
				
		} else if(params == 'VolumeChangeUp') {			
			data = '{  "jsonrpc": "2.0", "method": "' + action + '", "params": { "volume": "increment" },  "id":  '+ SlimMediaCenterInit.playerid +'  }';  
			
		} else if(params == 'VolumeChangeDown') {						
			data = '{  "jsonrpc": "2.0", "method": "' + action + '", "params": { "volume": "decrement" },  "id":  '+ SlimMediaCenterInit.playerid +'  }'; 
			
		} else if (params == 'PleasePlayFromShahed' || params == 'PleaseTryThis')  {						
			data= '{ "jsonrpc": "2.0", "method": "Player.Open", "params":{"item": {"file" : "'+ action +'" }}, "id" :  '+ SlimMediaCenterInit.playerid +' }';	
			
		} else if(params == 'PleaseTryThisLink') {
			// play external link in text box directly to kodi
			var TryThisLink = $('#PleasePlayThisLink_URL').val() ;			
			data= '{ "jsonrpc": "2.0", "method": "Player.Open", "params":{"item": {"file" : "'+ TryThisLink +'" }}, "id" :  '+ SlimMediaCenterInit.playerid +' }';	
			
		} else if(params == 'PleaseGiveMeTheDownloadLink') {
			// A TESTER
			var TryThisLink = $('#PleasePlayThisLink_URL').val() ;			
			data= '{ "jsonrpc": "2.0", "method": "Files.PrepareDownload", "params":{"path" : "'+ TryThisLink +'" }, "id" :  '+ SlimMediaCenterInit.playerid +' }';	
		} else if(params == 'PleasePlayYoutubeLink') {
			// A TESTER			
			var TryThisLink = $('#PleasePlayThisLink_URL').val() ;
			// Youtube link = trythislink youtube ID regex
			var YoutubeVideoId = new RegExp ("^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*");
			data= '{ "jsonrpc": "2.0", "method": "Player.Open", , "params":{"item": {"file" : "plugin://plugin.video.youtube/?action=play_video&videoid='+ YoutubeVideoId +'" }}, "id" :  '+ SlimMediaCenterInit.playerid +' }';			
		} else if(params == 'PleaseDownloadThisLink') {
			// A TESTER
			var TryDownloadingThisLink = $('#PleasePlayThisLink_URL').val() ;			
			data= '{ "jsonrpc": "2.0", "method": "Files.download", "params":{"path": "http://serv3.ddns.me/file.php?id=jtzilq1Fy4&l=n.avi" }, "id" :  '+ SlimMediaCenterInit.playerid +' }';	
			
		}  else if(params == 'PleaseShowSubtitles') {
			// A TESTER				
			//data= '{ "jsonrpc": "2.0", "method": "GUI.ActivateWindow", "params": { "window": "SubtitleSearch", "id": "1" }';	$('[data-current-media="title"]').text();	
			data = '{"jsonrpc":"2.0","id":1,"method":"GUI.ActivateWindow","params":{"window":"subtitlesearch"}}';
			
		}else if(params == 'smallforward') {
			data = '{"jsonrpc":"2.0","id":1,"method":"Player.Seek","params":{"playerid":' + SlimMediaCenterInit.playerid + ',"value":"smallforward" }}';
			
		}else if(params == 'smallbackward') {
			data = '{"jsonrpc":"2.0","id":1,"method":"Player.Seek","params":{"playerid":' + SlimMediaCenterInit.playerid + ',"value":"smallbackward" }}';
			
		}else {	
			SlimMediaCenterInit.getActivePlayer();
			params = params.split("'").join('"');
			data = '{ "jsonrpc": "2.0", "method": "' + action + '", "params": { "playerid": ' + SlimMediaCenterInit.playerid + ', ' + params + ' } }';
		}
		
		jQuery.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?SendRemoteKey',
			data: data,
			// beforeSend : function(){ 
			// var interval = setInterval(function(){
			// $.mobile.loading('show',{
//             text: 'Sending ...' ,
//             textVisible: true,
//             theme: 'a',
//             textonly: false            
//     		});
			// clearInterval(interval);
			// },1); 
			// },
			// complete: function(){
			// var interval = setInterval(function(){
			// $.mobile.loading('hide');
			// clearInterval(interval);
			// },1); 
			// },
			// success: jQuery.proxy(function(data) {
			//SlimMediaCenterRemote.getVolume();				
			// }, this),
			dataType: 'json'
		});
	
	}
}



//Keyboard 
function SendKeyboardToXbmc(KeyPressed)
{
	if($(KeyPressed.target).is("input, textarea"))
	{
      return;
	}
	
switch (KeyPressed.which) {
      case 37: // left        
		SlimMediaCenterRemote.remotePressed("Input.Left", "");		
        break;
      case 38: // up        
		SlimMediaCenterRemote.remotePressed("Input.Up", "");		
        break;
      case 39: // right
        SlimMediaCenterRemote.remotePressed("Input.Right", "");		
        break;
      case 40: // down
        SlimMediaCenterRemote.remotePressed("Input.Down", "");
        break;
      case 8: // backspace
        SlimMediaCenterRemote.remotePressed("Input.Back", "");		
        break;
      case 13: // enter
        SlimMediaCenterRemote.remotePressed("Input.Select", "");		
        break;
      case 67: // c (context)
        SlimMediaCenterRemote.remotePressed("input.ContextMenu", "");		
        break;
      case 107: // + (vol up)
		SlimMediaCenterRemote.remotePressed("Application.SetVolume","VolumeChangeUp");        
        break;
      case 109: // - (vol down)
		SlimMediaCenterRemote.remotePressed("Application.SetVolume","VolumeChangeDown");        
        break;
      case 32: // spacebar (play/pause)
        SlimMediaCenterRemote.remotePressed("Player.PlayPause", "player");		
        break;
      case 88: // x (stop)
        SlimMediaCenterRemote.remotePressed("Player.Stop", "player");		
        break;           
      default: // return everything else here
        return;
    }

    //success!
    KeyPressed.preventDefault();

}


var Local_Movies = {	
	showMain: function() {
		$('#movielist').html("");
		$('#moviemainlist').html("");
		jQuery.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?GetMovies',
			data: '{ "jsonrpc": "2.0", "method": "VideoLibrary.GetMovies", "params": { "limits": { "start": 0 }, "properties": [ "thumbnail", "tagline", "title", "rating" ], "sort": { "method": "sorttitle", "ignorearticle": true } }, "id": 1 }',
			beforeSend : function(){ 
			var interval = setInterval(function(){
			$.mobile.loading('show',{
            text: 'Getting Local Movies ...' ,
            textVisible: true,
            theme: 'a',
            textonly: false            
    		});
			clearInterval(interval);
			},1); 
			},
			complete: function(){
			var interval = setInterval(function(){
			$.mobile.loading('hide');
			clearInterval(interval);
			},1); 
			},
			
			success: jQuery.proxy(function(data) {
				

				$.each($(data.result.movies), jQuery.proxy(function(i, item) {
					var stars = '';

					for(var i = 0; i < 10; i = i + 2) {
						if(i < Math.round(item.rating)) {
							stars += '<img src="themes/images/star.png" alt="Star" />';
						} else {
							stars += '<img src="themes/images/star-gray.png" alt="Star" />';
						}
					}					
						$('#moviemainlist')
							.append('<li><a href="#movies-details" data-movie-id="' + item.movieid + '"><img src="/image/' + encodeURI(item.thumbnail) + '" alt="Thumnail" />' + item.title + '<br />' + stars + '<br /><p>' + item.tagline + '</p></a></li>')
							.trigger('create');
					
				}));

				try {
					$('#moviemainlist').listview('refresh');
				} catch(ex) {}

				$('[data-movie-id]').on('click', function() {
					localStorage.setItem('movie-id', $(this).attr('data-movie-id'));
					Local_Movies.showDetails();
				});
			}, this),
			dataType: 'json'
		});
	},
	showDetails: function() {
		var id = localStorage.getItem('movie-id');

		jQuery.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?GetMovies',
			data: '{ "jsonrpc": "2.0", "method": "VideoLibrary.GetMovieDetails", "params": { "movieid": ' + id + ', "properties": [ "genre", "director", "cast", "tagline", "plot", "title", "lastplayed", "runtime", "year", "playcount", "rating", "thumbnail" ] }, "id": 1 }',
			success: jQuery.proxy(function(data) {
				$('#movie-details-list').html('');
				$('#movie-details-list').append('<li data-role="list-divider" id="movie-actions">Actions</li>');
				$('#movie-details-list').append('<li data-role="list-divider" id="movie-plot" >Plot</li>');
				$('#movie-details-list').append('<li data-role="list-divider" id="movie-genres">Genres</li>');
				$('#movie-details-list').append('<li data-role="list-divider" id="movie-info">More info</li>');
				$('#movie-details-list').append('<li data-role="list-divider" id="movie-crew">Director</li>');
				$('#movie-details-list').append('<li data-role="list-divider" id="movie-cast">Cast</li>');
				

				$("#movie-title").text(data.result.moviedetails.title);
				$("#movie-plot").after('<li class="PleaseNoWrapping" >' + data.result.moviedetails.plot + '</li>');
				$("#movie-genres").after(SlimMediaCenterUtils.split(data.result.moviedetails.genre));

				for(var i = data.result.moviedetails.cast.length - 1; i >= 0 ; i--) {
					var img = data.result.moviedetails.cast[i].thumbnail ? '/image/' + encodeURI(data.result.moviedetails.cast[i].thumbnail) : 'images/unknown-actor.gif';


					$("#movie-cast").after('<li><img src="' + img + '" alt="Actor" />' + data.result.moviedetails.cast[i].name + '<br /><p>' + data.result.moviedetails.cast[i].role + '</p></li>');
				}

				$("#movie-crew").after(SlimMediaCenterUtils.split(data.result.moviedetails.director));
				$("#movie-info").after('<li>Released in ' + data.result.moviedetails.year + '</li>');
				$("#movie-info").after('<li>Duration: ' + Math.round(data.result.moviedetails.runtime / 60) + ' minutes</li>');
				$("#movie-actions").after('<li><a data-role="PlayThisMovie" href="javascript:Local_Movies.playMovie();">Play movie</a></li>');

				$('#movie-details-list').listview('refresh');
				$('[data-role=PlayThisMovie]').button();
			}, this),
			dataType: 'json'
		});
	},
	playMovie: function() {
		var id = localStorage.getItem('movie-id');

		jQuery.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?PlayMovie',
			beforeSend : function(){ 
			var interval = setInterval(function(){
			$.mobile.loading('show',{
            text: 'Loading Movie ..' ,
            textVisible: true,
            theme: 'b',
            textonly: false            
    		});
			clearInterval(interval);
			},1); 
			},
			complete: function(){
			var interval = setInterval(function(){
			$.mobile.loading('hide');
			clearInterval(interval);
			},1); 
			},
			data: '{ "jsonrpc": "2.0", "method": "Player.Open", "params": { "item": { "movieid": ' + id + ' } }, "id": 1 }',
			success: jQuery.proxy(function(data) {
				// do nothing
			}, this),
		dataType: 'json'});
	}
}



var SlimMediaCenterAddons = {
	isInitialized: false,	
	ShowAddonsList: function() {
	if(SlimMediaCenterAddons.isInitialized) 
	{
	  //console.log('ShowAddonsList is already init');
      return;
	}
	else
	{

		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?GetAddons',
			data: '{ "jsonrpc": "2.0", "id":1, "method":"Addons.GetAddons","params":{"limits": { "start": 0 }, "properties":["author","description","disclaimer","enabled","fanart","name","path","rating","summary","thumbnail","version"]}}',	
			beforeSend : function(){ 
			var interval = setInterval(function(){
			$.mobile.loading('show',{
            text: 'Loading' ,
            textVisible: true,
            theme: 'b',
            textonly: false            
    		});
			clearInterval(interval);
			},1); 
			},
			complete: function(){
			var interval = setInterval(function(){
			$.mobile.loading('hide');
			clearInterval(interval);
			},1); 
			},
			success: function(data){
				$('#MyAddons-List').html("");			
				
				$.each($(data.result.addons), function(i, item) {
					//if item.name 				
						$('#MyAddons-List')
							.append('<li><a href="#BrowseMyAddon" data-addon-path="' + item.addonid + '"><img src="/image/' + encodeURI(item.thumbnail) + '" alt="Thumnail" class="ui-li-thumb" />' + item.name + '</br><p>' + item.description + '</p></a></li>')
							.trigger('create');
					
				});

				try {
					$('#MyAddons-List').listview('refresh');
				} catch(ex) {}

				$('[data-addon-path]').on('click', function() {
				var url = 'plugin://' + $(this).attr('data-addon-path');
					SlimMediaCenterAddons.BrowseMyAddon(url);
					
					SlimMediaCenterAddons.isInitialized = true;
					//Ajouter la fonction pour recherche les sous truc des addons
				});
			},			
			
			dataType: 'json'
			});		
	
	}
	},
	BrowseMyAddon: function(Path) {
	
		//var url = Path.substring(Path.lastIndexOf('addons/'));
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?GetDirectory',
			data: '{"jsonrpc":"2.0","id":1,"method":"Files.GetDirectory","params":{"directory":"' + Path + '","media":"video","properties":["title","thumbnail","fanart","rating","genre","artist","track","season","episode","year","duration","album","showtitle","playcount","file","mimetype","size","lastmodified","resume"],"sort":{"method":"label","order":"ascending"}}}',
			beforeSend : function(){ 
			var interval = setInterval(function(){
			$.mobile.loading('show',{
            text: 'Loading Addons...' ,
            textVisible: true,
            theme: 'b',
            textonly: false            
    		});
			clearInterval(interval);
			},1); 
			},
			complete: function(){
			var interval = setInterval(function(){
			$.mobile.loading('hide');
			clearInterval(interval);
			},1); 
			},
			success: jQuery.proxy(function(data) 
			{
				$('#BrowseMyAddon-List').html("");			
				$.each($(data.result.files), jQuery.proxy(function(i, item) 
				{
									
						$('#BrowseMyAddon-List')
							.append('<li><a href="#BrowseMyAddon" data-addon-type="'+ item.filetype +'" data-addon-path2="' + item.file + '"><img src="/image/' + encodeURI(item.thumbnail) + '" alt="Thumnail" class="ui-li-thumb"/>' + item.label + '</a></li>')
							.trigger('create');
					
				}));
				
				try {
					$('#BrowseMyAddon-List').listview('refresh');
				} catch(ex) {}
				
				$('[data-addon-path2]').on('click', function() {
					if ($(this).attr('data-addon-type') == 'file')
						{
						//on envoi le liens en play.
						SlimMediaCenterRemote.remotePressed($(this).attr('data-addon-path2'), 'PleaseTryThis');
						}					
					else
						{						
						SlimMediaCenterAddons.BrowseMyAddon($(this).attr('data-addon-path2'));
						//Ajouter la fonction pour recherche les sous truc des addons
						}
				});
			
			}, this),
			dataType: 'json'});
	}

}
 

function GenesisBrowseFullMovieMenu(Path_To_Addon,What_To_Do,History_From) {	
		//Remove handlers and use my new ones
		$('[data-addon-path-GenesisPath]').off();
		//Clear screen
		$('#PagePuteBrowser-List').html("");  
		$('#PagePuteBrowser-List-Other').html("");	
		//Hide More Sources Btn
		$('#PagePuteBrowser-List-Other-HiddenCollapsible').hide();
		
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: SlimMediaCenterInit.JSON_RPC + '?GetDirectory',
			data: '{"jsonrpc":"2.0","id":1,"method":"Files.GetDirectory","params":{"directory":"' + Path_To_Addon + '","media":"video","properties":["title","thumbnail","fanart","rating","genre","artist","track","season","episode","year","duration","album","showtitle","playcount","file","mimetype","size","lastmodified","resume"]}}',
			error: jQuery.proxy(function(){	
			alert("Erreur Serveur");	
			}),
			beforeSend : function(){ 
			var interval = setInterval(function(){
			$.mobile.loading('show',{
            text: 'Loading' ,
            textVisible: true,
            theme: 'b',
            textonly: false            
    		});
			clearInterval(interval);
			},1); 
			},
			complete: function(){
			var interval = setInterval(function(){
			$.mobile.loading('hide');
			clearInterval(interval);
			},1); 
			},
			success: jQuery.proxy(function(data) 
			{
			
			
			if( typeof (data.result) === 'undefined')
			{
			//$('#PagePuteBrowser-List').html("");
			
			 $('#PagePuteBrowser-List')
									.append('<li><a class="GenesisBtn" href="#PagePuteBrowser" data-addon-type="GoHome" data-addon-path-GenesisERRORPath="' + History_From + '"> Pas de Sources </a></li>')
									.trigger('create');		
						
					
			$('#PagePuteBrowser-List').listview('refresh');		
			
			$('[data-addon-path-GenesisERRORPath]').on('click', function() {				
																			
							//boucle sur la meme fonction							
							GenesisBrowseFullMovieMenu($(this).attr('data-addon-path-GenesisERRORPath'),'ShowFullPage',Path_To_Addon);						
							//Change Title
							var title = $(this).text();
							$('#PagePuteBrowser-Title').text(title);
							
						
			});	
			
			}
			else
			{
				
				$('#PagePuteBrowser-List').html("");
				$('#PagePuteBrowser-List-Other').html("");
				
				if ( What_To_Do == 'ShowFullPage' )
				{
					$.each($(data.result.files), jQuery.proxy(function(i, item) 
					{							
								$('#PagePuteBrowser-List')
									.append('<li><a class="GenesisBtn" href="#PagePuteBrowser" data-addon-type="'+ item.filetype +'" data-addon-path-GenesisPath="' + item.file + '"><img src="/image/' + encodeURI(item.thumbnail) + '" alt="Thumnail" class="ui-li-thumb"/><p>'+ item.label + '</p></a></li>')
									.trigger('create');																	
					}));
					
					//hide More Source if on btn back
					$('#PagePuteBrowser-List-Other-HiddenCollapsible').hide();
				}
				else if ( What_To_Do == 'ShowSources' )
				{	
					$.each($(data.result.files), jQuery.proxy(function(i, item) 
					{	
						// Test pour prendre juste MOVREEL					
						// var MovReelLink = item.label;						
						// var IF_MOVREEL_in_Link = MovReelLink.search("MOVREEL");						
						// if ( IF_MOVREEL_in_Link > 0)
							// {
							// test si movreel mettre ici
							$('#PagePuteBrowser-List')
								.append('<li><a class="GenesisBtn" href="#PagePuteBrowser" data-addon-type="'+ item.filetype +'" data-addon-path-GenesisPath="' + item.file + '"><img src="/image/' + encodeURI(item.thumbnail) + '" alt="Thumnail" class="ui-li-thumb" /><p>'+ item.label + '</p></a></li>')
								.trigger('create');
							// }
						// else
							// {
							//Sinon Pas moovreel ici dans liste collapse
							// $('#PagePuteBrowser-List-Other')
								// .append('<li><a class="GenesisBtn" href="#PagePuteBrowser" data-addon-type="'+ item.filetype +'" data-addon-path-GenesisPath="' + item.file + '"><img src="/image/' + encodeURI(item.thumbnail) + '" alt="Thumnail" class="ui-li-thumb"/><p>'+ item.label + '</p></a></li>')
								// .trigger('create');
							// }
						//hide More Source if bi filter on sources 
					$('#PagePuteBrowser-List-Other-HiddenCollapsible').hide();
					
					}));				
								
				}
				else
				{
				console.log('kahara big broblem');
				}					
					
					
				
				
				
				
				try {				
					if (History_From == 'Home')			
					{
						// If from home back takes you home
						$('#PagePuteBrowser-Header-BtnBack').attr('data-addon-type', 'GoHome');
						$('#PagePuteBrowser-Header-BtnBack').attr('href', '#home');
						$('#PagePuteBrowser-Header-BtnBack').text('Menu');
						
						//hideNext
						// BTN_NEXT $('#PagePuteBrowser-Header-BtnNext').hide();

						//Change Title
						$('#PagePuteBrowser-Title').text('Movies Menu');
					}					
					else
					{	
						//If from other places than home back takes you to the latest link
						$('#PagePuteBrowser-Header-BtnBack').attr('data-addon-path-GenesisPath', History_From);
						$('#PagePuteBrowser-Header-BtnBack').attr('href', '#PagePuteBrowser');
						$('#PagePuteBrowser-Header-BtnBack').attr('data-addon-type', 'directory');
						$('#PagePuteBrowser-Header-BtnBack').text('Back');					
												
					}
					
					$('#PagePuteBrowser-Header')						
						.trigger('create');					
					
					$('#PagePuteBrowser-List').listview('refresh');
					
					//If ShowSources Show Collapsible sources
					if ( What_To_Do == 'ShowSources' )
					{
					//console.log('So much links');					
					$('#PagePuteBrowser-List-Other-HiddenCollapsible').show();
					$('#PagePuteBrowser-List-Other').listview('refresh');
					}
					
				} catch(ex) {}
				
				
				$('[data-addon-path-GenesisPath]').on('click', function() {				
					if ($(this).attr('data-addon-type') == 'file')
						{
						//on envoi le liens en play.
						SlimMediaCenterRemote.remotePressed($(this).attr('data-addon-path-GenesisPath'), 'PleaseTryThis');
						}					
					else if ($(this).attr('data-addon-type') == 'GoHome') 
						{
						console.log('GoingHome');
						}
					else
						{	
						var GetMovieSources =  $(this).attr('data-addon-path-GenesisPath') ;
						var IF_GetMovieSources = GetMovieSources.search("action=get_host");	
						
						if (IF_GetMovieSources > 0)
							{
							//MOVREEL SOURCES DISPLAY IN 
							GenesisBrowseFullMovieMenu($(this).attr('data-addon-path-GenesisPath'),'ShowSources',Path_To_Addon);
							}
						else
							{														
							//boucle sur la meme fonction							
							GenesisBrowseFullMovieMenu($(this).attr('data-addon-path-GenesisPath'),'ShowFullPage',Path_To_Addon);						
							//Change Title
							var title = $(this).text();
							$('#PagePuteBrowser-Title').text(title);
							}
						}
				});	
			}
			
			}, this),			
			dataType: 'json'});
			
			
				
				
}


//ALL TV
//{"jsonrpc":"2.0","id":1,"method":"Files.GetDirectory","params":{"directory":"plugin://plugin.video.shahidmbcnet/?url=all&mode=15&name=All","media":"video","properties":["title","thumbnail","fanart","rating","genre","artist","track","season","episode","year","duration","album","showtitle","playcount","file","mimetype","size","lastmodified","resume"],"sort":{"method":"label","order":"ascending"}}}


//Initialisation
$(document).on( "pagecontainershow", function() {
  SlimMediaCenterInit.init() ;
  SlimMediaCenterRemote.init() ; 

});

$(document).on( 'click', '#TogglePagePuteView' , function() { 
  $( "#PagePuteBrowser" ).toggleClass( "my-page" );
});

//Myaddons
$(document).on( 'click', '#MyAddonsBtn' , function() {
		  SlimMediaCenterAddons.ShowAddonsList() ;
});



//IceMoviesHD
$(document).on( 'click', '#HD_MoviesBtn_IceMoviesHD' , function() {	
		var IceMoviesHD_LatestMovies_Url  =  'plugin://plugin.video.icefilms/?url=http%3A%2F%2Fwww.icefilms.info%2Fmovies%2Frelease%2Fhd&mode=2&name=Latest+Releases';	  
		  //SlimMediaCenterShowIceMoviesHdList() ;
		GenesisBrowseFullMovieMenu(IceMoviesHD_LatestMovies_Url,'ShowFullPage','Home') ;  
});

//Shahed All Channels
$(document).on( 'click', '#More_LiveTV' , function() {	
		//600Channels
		//var Shahed_All_Tv_Channels  =  'plugin://plugin.video.shahidmbcnet/?url=all&mode=15&name=All';	  
		//Menu Live TV Shahed
		var Shahed_All_Tv_Channels  = 'plugin://plugin.video.shahidmbcnet/?url=CCats&mode=14&name=Shahid+Live';
		  //SlimMediaCenterShowIceMoviesHdList() ;
		GenesisBrowseFullMovieMenu(Shahed_All_Tv_Channels,'ShowFullPage','Home') ;  
});




//Genesis Latest Movies
$(document).on( 'click', '#HD_Movies_Btn_GenesisLatestMovies' , function() {		  
		var Genesis_LatestMovies_Url =  "plugin://plugin.video.genesis/?action=movies_added_hd" ;
		GenesisBrowseFullMovieMenu(Genesis_LatestMovies_Url,'ShowFullPage','Home') ;
});

//Genesis  Movies Menu
$(document).on( 'click', '#HD_Movies_Btn_GenesisBrowseFullMovieMenu' , function() {		  
		
		var Genesis_All_Movies_Url =  "plugin://plugin.video.genesis/?action=root_movies" ;
		GenesisBrowseFullMovieMenu(Genesis_All_Movies_Url,'ShowFullPage','Home') ;
});

//Genesis  Movies Menu
$(document).on( 'click', '#HD_Movies_Btn_Genesis_Theaters' , function() {		  
		
		var Genesis_Theaters_Url =  "plugin://plugin.video.genesis/?action=movies_theaters" ;
		GenesisBrowseFullMovieMenu(Genesis_Theaters_Url,'ShowFullPage','Home') ;
});

//Genesis  TV Menu
$(document).on( 'click', '#TV_Btn_Genesis_FullTvMenu' , function() {	
		var Genesis_TvMenu_Url =  "plugin://plugin.video.genesis/?action=root_shows" ;
		GenesisBrowseFullMovieMenu(Genesis_TvMenu_Url,'ShowFullPage','Home') ;
});

//Genesis  TV Menu
$(document).on( 'click', '#TV_Btn_Genesis_MostVoted' , function() {	
		var Genesis_TvMostVoted_Url =  "plugin://plugin.video.genesis/?action=shows_views" ;
		GenesisBrowseFullMovieMenu(Genesis_TvMostVoted_Url,'ShowFullPage','Home') ;
});

//RadioTunesList  TV Menu
$(document).on( 'click', '#RadioTunesList' , function() {	
		var RadioTunesList_Url =  "plugin://plugin.audio.radiotunes.com" ;
		GenesisBrowseFullMovieMenu(RadioTunesList_Url,'ShowFullPage','Home') ;
});

//RadioTunesList  TV Menu
$(document).on( 'click', '#MyLocalMoviesBtn' , function() {	
		Local_Movies.showMain();
});

//ScanAudioLib  Audio library scan
$(document).on( 'click', '#ScanAudioLib' , function() {	
	SlimMediaCenterInit.scan('Audio');
});

//ScanVideoLib  Audio library scan
$(document).on( 'click', '#ScanVideoLib' , function() {	
	SlimMediaCenterInit.scan('Video');
});
		
			
			
$( document ).ready(function() {

			
		if (needRedirect) {
			$.mobile.changePage("#home");
			needRedirect = false;
		}
		
		//Keyboard to xbmc	
		 $(document).keydown(function(KeyPressed){
			SendKeyboardToXbmc(KeyPressed);
			});

	 
		 //Custom ArabicChannel Listener
		 $('[data-channel-params]').on('click', function() {					
				//on envoi le liens en play.
				SlimMediaCenterRemote.remotePressed($(this).attr('data-channel-action'), 'PleasePlayFromShahed');						
		});
		  
		
		$( ".ExternalRemote" ).panel({
		  animate: false
		});
		
		$( ".dynamic-slider-form" ).on( "slidestop", function(event, ui  ) {				
				var SetVolume =  event.target.value;
				SlimMediaCenterRemote.remotePressed( SetVolume , 'VolumeChangeToThis');
					
				 
		});
		
		SlimMediaCenterRemote.getVolume();
		
		

	
});



	
