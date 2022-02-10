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
  //下拉到底部後，讀取更多實況
  $(window).on("scroll", () => {
    if (
      $(window).scrollTop() + $(window).height() >=
      $(document).height() - 200
    ) {
      //設置setTimeout防抖動
      clearTimeout(timer);
      timer = setTimeout(() => {
        getStreams();
      }, 300);
    }
  });
  //switch language
  $(".lang a").on("click", (e) => {
    let stream_lang = $(e.target).attr("class");
    setLang(stream_lang);
  });
});

function setLang(lang) {
  //if same language, dont reload
  if (language === lang) return;
  //set title
  $(".container .menu h1").text(window.I18N[lang].title);
  //clear current stream
  $(".container .row").html(
    `<div id="empty" class="column"></div>
  <div class="column"></div>
  <div class="column"></div>`
  );
  language = lang;
  now_index = "";
  getStreams();
}

//抓實況資料
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
      getUsers(streams);
    },
    error: function (xhr) {
      console.log(xhr.status);
      console.log(xhr.responseText);
    },
  });
}

//抓實況主資料
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
      getColumn(streams, users);
    },
    error: function (xhr) {
      console.log(xhr.status);
      console.log(xhr.responseText);
    },
  });
}

//動態新增
function getColumn(streams, users) {
  for (const stream_data of streams.data) {
    for (const user_data of users.data) {
      //按照stream_data的user_id順序排列
      if (stream_data.user_id === user_data.id) {
        let thumbnail_url = stream_data.thumbnail_url.replace(
          "-{width}x{height}",
          ""
        );
        let column = $(
          `<div class="column">
            <div class="preview">
              <a href="https://www.twitch.tv/${stream_data.user_login}"><img
                src="${thumbnail_url}"
                alt=""
                onload="this.style.opacity=1"
              /></a>
            </div>
            <div class="bottom">
              <div class="avatar">
                <img
                  src="${user_data.profile_image_url}"
                  alt=""
                  onload="this.style.opacity=1"
                />
              </div>
              <div class="intro">
                <div class="channel_name" title="${stream_data.title}">${stream_data.title}</div>
                <div class="streamer_name" title="${stream_data.user_name}">${stream_data.user_name}</div>
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
