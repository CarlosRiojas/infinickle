import { ytkey } from './youtubeapi.js';

let myTags: string[] = [];
let nextPageToken: string = "";
declare var YT: any;
const tagInput = document.getElementById('tagInput') as HTMLInputElement | null;
const addTagButton = document.getElementById('addTagButton') as HTMLButtonElement | null;
const tagList = document.getElementById('tagList') as HTMLUListElement | null;
let player: any;


//We add an event listener to the "Add Tag" button. 
// When clicked, it checks if the input field is not empty, adds the tag to the myTags array
//  creates a new list item in the tagList, and clears the input field.
addTagButton?.addEventListener('click', () => {
    if(!tagInput || !tagList) return;
    
    const newTag = tagInput.value.trim();

    /*if there is an input and not an empty */

    if (newTag && newTag.trim() !== '') {
        myTags.push(newTag);
        let listItem = document.createElement('li');/*this creates a new list*/
        listItem.textContent = newTag; // this creates the text context to be taken as data*/
        tagList.appendChild(listItem);//this appends it to the ul block
        
        tagInput.value = ''; // Clear the input field after adding the tag
        console.log('Current Tags:', newTag); // Log the current tags to the console
    }
        }
            ) 
//Buttons definition and asignment of event listeners to control the YouTube player.
const playButton = document.getElementById('playButton') as HTMLButtonElement | null;
const pauseButton = document.getElementById('pauseButton') as HTMLButtonElement | null;
const stopButton = document.getElementById('stopButton') as HTMLButtonElement | null;  
const nextButton = document.getElementById('nextButton') as HTMLButtonElement | null;
const infinitePlaylistCheckbox = document.getElementById('infinitePlaylistCheckbox') as HTMLInputElement | null;
const clearTagsButton = document.getElementById('clearTagsButton') as HTMLButtonElement | null;

function onPlayerReady(event: any) {
    console.log('Player is ready', event);
}


infinitePlaylistCheckbox?.addEventListener('change', () => {
     infinitePlaylistCheckbox.checked;
    })

playButton?.addEventListener('click', () => {
    if (player) {
        player.playVideo();
    }
});
pauseButton?.addEventListener('click', () => {
    if (player) {
        player.pauseVideo();
    }
});
stopButton?.addEventListener('click', () => {
    if (player) {
        player.stopVideo();
    }
});
nextButton?.addEventListener('click', () => {
    if (player) {
        player.nextVideo();
    }
});
clearTagsButton?.addEventListener('click', () => {
    myTags = [];
    if (tagList) {
        tagList.innerHTML = ''; // Clear the displayed list of tags
    }
})

//We use the tags to search for videos on YouTube using the YouTube Data API v3. 
//The search results will be logged to the console.
async function tagSearch() {
    if (myTags.length === 0) {
        console.log('No tags to search for.');
        return;
    } else {
        const searchQuery = myTags.join('+'); // Join the tags with '+' for the search query
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${searchQuery}&pageToken=${nextPageToken}&key=${ytkey}`;
        try {
            const urldata = await fetch(apiUrl);
            const jsonData = await urldata.json();

            if (jsonData.nextPageToken) {
                nextPageToken = jsonData.nextPageToken;
            }

            console.log('Search Results:', jsonData);
            const videoIds = jsonData.items
                .map((item: any) => item.id.videoId)
                .filter((id: string | undefined) => id !== undefined);
            const videoIdString = videoIds.join(',');
            return videoIdString;
        } catch (error) {
            console.error('Error fetching data from YouTube API:', error);
        }
    }
}

function onPlayerStateChange(event: any) {
    console.log('Player state changed', event.data);
    if(infinitePlaylistCheckbox?.checked && event.data === YT.PlayerState.ENDED) {
        tagSearch().then((videoIdString) => {
                player.loadPlaylist({
                    index: 0,
                    playlist: videoIdString,
                    startSeconds: 0,
                });
            }
)
    }
}

const searchTagButton = document.getElementById('searchTagButton') as HTMLButtonElement | null;

searchTagButton?.addEventListener('click', async () => {
    const videoIdString = await tagSearch();

    if (videoIdString && typeof YT !== 'undefined') {
        if (player) {
            player.loadPlaylist({
                index: 0,
                playlist: videoIdString,
                startSeconds: 0,
            });
        } else {
            player = new YT.Player('player', {
                height: '390',
                width: '640',
                playerVars: {
                    autoplay: 1,
                    playlist: videoIdString,
                    controls: 1,
                    origin: window.location.origin
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                },
            });
        }
    } else if (player && !videoIdString) {
        player.stopVideo();
        console.log('Player is ready but no videoIdString is available to load, stopping the video.');
    }
});

