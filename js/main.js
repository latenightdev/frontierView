// R.H. - 1/31/16 - FrontiewView web app

document.addEventListener('DOMContentLoaded', ff_images());

function ff_images() {

  // Flickr endpoint
  var baseUrl = 'https://api.flickr.com/services/rest/?';

  // Default get parameters
  var query = {
    method: 'flickr.photos.search',
    api_key: 'a5e95177da353f58113fd60296e1d250',
    user_id: '24662369@N07',   
    format: 'json',
    nojsoncallback: 1,
    per_page: 15,
    page: 1,
    sort: 'date-posted-desc',
    text: '',
    extras: 'owner_name'
  };  

  // State variables
  var img_id = 0;
  var maxPage = 0;
  var isLoading = false;

  // Listener for search form
  var searchForm = document.getElementById('search-form');
  document.getElementById('search-text').value = '';
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var searchInput = document.getElementById('search-text').value;
    if (searchInput !== '') {
      query.text = searchInput;
      refresh();
    }
  });   

  // Listener for sort options
  var sortOptions = document.getElementById('sort-view');
  sortOptions.onchange = function(event) {
    var selected = sortOptions.selectedIndex;
    var selectedValue = sortOptions.options[selected].value;
    query.sort = selectedValue;
    refresh();
  };

  // Listener for lightbox close
  var closeButton = document.getElementById('lightbox-close');
  closeButton.addEventListener('click', function (event) {
    event.preventDefault();
    closeLightbox();
  });

  // Set window scroll listener to load more images
  window.addEventListener('scroll', function() {
    var scroll = window.scrollY || window.pageYOffset;
    var height = document.height || document.body.scrollHeight;
    if (window.innerHeight + scroll > height - 50 && isLoading == false) {
      if (query.page < maxPage) {
        getImages();
      }
    }
  });

  // Loop through query object to build query string
  function buildQuery() {
    var queryString = '';
    var count = 0;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        queryString += '&' + key + '=' + query[key];
      }
      count ++;
    }
    return baseUrl + queryString;    
  }  

  // Fetches image data from Flickr
  function getImages() {
    // Loading state
    isLoading = true;
    document.getElementById('loader').style.display = 'block';

    // Get query and send get request
    var url = buildQuery();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    // Onload parse the response as JSON object
    xhr.onload = function() {
      if (this.status == 200) {
        var obj = JSON.parse(this.response);
        parseData(obj, 'image-view');
      }
    };

    // Error from get call
    xhr.onerror = function(error) {
      document.getElementById('loader').style.display = '';
      alert('Could not connect to API due to: ' + error);
      isLoading = false;
    };
    xhr.send();  
  }    

  // Iterate through data and append to the DOM
  function parseData(obj, elem) {  
    // Get array of photos
    var arr = obj.photos.photo;

    // Set max page from this data set
    maxPage = obj.photos.pages;

    // No results found
    if (arr.length == 0) {
      alert('No results found');
    }

    // Add a page number if we're paginating
    if (query.page > 1) {
      var heading = document.createElement('h3');
      heading.innerHTML = 'Page: ' + query.page;
      document.getElementById(elem).appendChild(heading);
    }

    // After each pull, create new ul wrapper
    var ul = document.createElement('ul');
    ul.className = 'images-' + query.page;
    document.getElementById(elem).appendChild(ul);

    // Append each image template as a list item
    for (var i = 0; i < arr.length; i++) {
      img_id++;
      var li = document.createElement('li');
      li.className = 'img-' + img_id;
      li.appendChild(buildTemplate(arr[i]));
      ul.appendChild(li);
    }

    // Display info about the results in the status bar
    if (query.text !== '') {
      document.getElementById('results').innerHTML = 'Displaying ' + img_id + ' Images matching "'+ query.text +'"';
    } else {
      document.getElementById('results').innerHTML = 'Displaying ' + img_id + ' Images';
    }

    // Loading state
    document.getElementById('loader').style.display = '';
    isLoading = false;
    query.page++;
  }

  // Receives single image object and returns html
  function buildTemplate(obj) {
    // Flickr url build
    var urlDefault = 'https://farm' + obj.farm + '.staticflickr.com/' + obj.server + '/' + obj.id + '_' + obj.secret + '.jpg';
    var urlLarge = 'https://farm' + obj.farm + '.staticflickr.com/' + obj.server + '/' + obj.id + '_' + obj.secret + '_b.jpg';

    // Template container
    var template = document.createElement('div');
    template.className = 'image-wrapper';

    // Build link and attach lightbox listener
    var link = document.createElement('a');
    link.href = urlLarge;
    link.addEventListener('click', function (event) {
      event.preventDefault();
      lightbox(this.href);
    });

    // Build image and append to link
    var image = document.createElement('img');
    image.src = urlDefault;
    link.appendChild(image);

    // Build image overlay with info
    var info = document.createElement('div');
    info.className = 'image-info';
    info.innerHTML = '<p class="image-title">'+ obj.title +'</p><p class="image-owner">'+ obj.ownername +'</p>'

    // Append link, image, info overlay
    template.appendChild(link);
    template.appendChild(info);
  
    return template;
  }

  // Clear data, refresh state, pull new data
  function refresh() {
    document.getElementById('image-view').innerHTML = '';
    img_id = 0;
    query.page = 1;
    window.scrollTo(0, 0);
    getImages();
  }  

  // Open lightbox (and overlay)
  function lightbox(image) {
    document.getElementById('preview').src = image;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('lightbox').style.display = 'block';
  }

  // Close lightbox
  function closeLightbox() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('lightbox').style.display = 'none';
    document.getElementById('preview').src = '';
  }

  // Kick off flickr image feed
  getImages();

}
