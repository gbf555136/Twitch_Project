const id = "rxwhz5x8cdyutt7l28ict4xnxux5ta";
const authorization = "ouedhepqcxrxh2l7shsw6me6ixjzav";
const streams_url = "https://api.twitch.tv/helix/streams";
const users_url = "https://api.twitch.tv/helix/users";
const game_id = 21779;
let language = "zh";
const load_num = 18;
let now_index = "";
let timer;

$(() => {
  getStreams();
  $(window).on("scroll", () => {
    //detect scroll bottom
    if (
      $(window).scrollTop() + $(window).height() >=
      $(document).height() - 200
    ) {
      //debounce
      clearTimeout(timer);
      timer = setTimeout(() => {
        getStreams();
      }, 300);
    }
  });
  //switch language
  $(".lang button").on("click", (e) => {
    let stream_lang = $(e.target).attr("class");
    setLang(stream_lang);
  });
});

function setLang(lang) {
  //if same language, dont reload
  if (language === lang) return;
  //clear current stream
  $(".container .row").html(
    `<div id="empty" class="column empty"></div>
    <div class="column empty"></div>
    <div class="column empty"></div>`
  );
  language = lang;
  now_index = "";
  getStreams();
}

//get live streams
function getStreams() {
  //check end
  if (now_index === undefined) return;
  $.ajax({
    url: streams_url,
    headers: {
      "Client-Id": id,
      Authorization: "Bearer " + authorization,
    },
    data: {
      game_id: game_id,
      language: language,
      first: load_num,
      after: now_index,
    },
    success: function (streams) {
      now_index = streams.pagination.cursor;
      // console.log(streams);
      getUsers(streams);
    },
    error: function (xhr) {
      console.log(xhr.status);
      console.log(xhr.responseText);
    },
  });
}

//get live streamers
function getUsers(streams) {
  //check end
  if (streams.data.length === 0) return;
  let user_ids = [];

  for (const stream_data of streams.data) {
    user_ids.push(stream_data.user_id);
  }

  $.ajax({
    url: users_url,
    headers: {
      "Client-Id": id,
      Authorization: "Bearer " + authorization,
    },
    data: {
      id: user_ids,
    },
    success: function (users) {
      // console.log(users);
      getColumn(streams, users);
    },
    error: function (xhr) {
      console.log(xhr.status);
      console.log(xhr.responseText);
    },
  });
}

function getColumn(streams, users) {
  for (const stream_data of streams.data) {
    for (const user_data of users.data) {
      //按照stream_data的user_id順序排列
      if (stream_data.user_id === user_data.id) {
        //modify thumbnail width and height
        let thumbnail_url = stream_data.thumbnail_url.replace(
          "{width}x{height}",
          "480x270"
        );
        let column = $(
          `<div class="column">
            <div class="preview">
              <a href="https://www.twitch.tv/${stream_data.user_login}"><img
                src="${thumbnail_url}"
                alt=""
                onload="handlePreviewLoad(this)"
              /></a>
              <div class="viewer">
                <i class="fas fa-user"></i>
                <span>${stream_data.viewer_count}</span>
              </div>
            </div>
            <div class="bottom">
              <div class="avatar">
                <img
                  src="${user_data.profile_image_url}"
                  alt=""
                  onload="handleAvatarLoad(this)"
                />
              </div>
              <div class="intro">
                <div class="channel_name" title="${stream_data.title}">
                  ${stream_data.title}
                </div>
                <div class="streamer_name" title="${stream_data.user_name}">
                  ${stream_data.user_name}
                </div>
              </div>
            </div>
          </div>`
        );
        //insert before empty div
        $(column).insertBefore($("#empty"));
        continue;
      }
    }
  }
}

function handlePreviewLoad(target) {
  $(target).css("opacity", "1");
  //img=>a=>preview=>viewer
  let viewer = $(target).parent().parent().children()[1];
  console.log(viewer);
  $(viewer).css("opacity", "1");
}

function handleAvatarLoad(target) {
  $(target).css("opacity", "1");
}
