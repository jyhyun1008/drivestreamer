
function getQueryStringObject() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}

var qs = getQueryStringObject()
var audio = qs.a
var pdf = qs.p
var list = qs.list

addEventListener("DOMContentLoaded", (event) => {
    if (!audio && !list) {
        document.querySelector('#player-box').innerHTML = "<div class='justText'>https://player.peacht.art/<span>?a={audio-url}&p={pdf-url}</span></div><div class='justText'>위 URL로 접속하시면 온라인상의 아무 음원(일단 미스키 드라이브에 있는 건 가능)이나 플레이어로 감싸서 + 악보와 함께 듣거나 공유하실 수 있습니다.</div><p></p><div class='justText'>https://player.peacht.art/<span>?list=local</span></div><div class='justText'>위 URL로 접속하시면 온라인상의 음원만으로 구성된 로컬 플레이리스트를 만드실 수 있습니다.</div><p></p><div class='justText'>https://player.peacht.art/<span>?list={list-textfile-url}</span></div><div class='justText'>위 URL로 접속하시면 다른 사람과 공유된 리스트에 접근하실 수 있습니다.</div>"
    } else if (list == 'local') {
        var playList = [] //json
        if (localStorage.getItem('playList')) {
            playList = JSON.parse(localStorage.getItem('playList'))
        }

        let sPlayList = playList
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

        var isShuffle = false
        var isPlaying = false
        var isLoop = false
        var volume = 1;
        var currentPlaying = {}
        
        document.querySelector('body').addEventListener("click", function () {
            if (!document.querySelector("audio")) {

                document.querySelector("#player-box").innerHTML = '<audio style="display:none;" ></audio><div id="musicTitle"></div><div id="playbar"><div id="playTime"></div><div><input type="range" id="duration" class="rangeInput" name="duration" min="0" max="100" value="0" /></div><div id="totTime"></div></div><div id="player"><div class="playButton"><i class="bx bx-play" ></i></div><div class="stopButton"><i class="bx bx-stop" ></i></div><div class="loopButton"><i class="bx bx-revision" style="color:#ff9899;" ></i></div><div class="shuffleButton"><i class="bx bx-shuffle" ></i></div><div><label for="volume"><i class="bx bxs-megaphone" ></i> </label><input type="range" class="rangeInput" id="volume" name="volume" min="0" max="100" value="100" /></div></div></div>'

                document.querySelector("#pdf-box").innerHTML = '<div id="form"><input type="text" class="textInput" id="addUrl" placeholder="재생목록에 추가할 음원 URL" /><input type="text" class="textInput" id="addTitle" placeholder="구분할 수 있는 제목" /><div id="addList">추가</div></div><div id="playList"></div>'

                for (let i = 0; i<playList.length; i++) {
                    document.querySelector("#playList").innerHTML +='<div class="listUrl"><div class="listTitle" id="title'+i+'">'+playList[i].title+'</div><div class="listDelete" id="delete'+i+'"><i class="bx bx-x"></i></div></div>'
                    console.log(i)
                }

                var addUrl = document.querySelector('#addUrl')
                var addTitle = document.querySelector('#addTitle')

                var audioplayer = document.querySelector("audio")
                if (playList.length > 0) {
                    document.querySelector("#musicTitle").innerText = playList[0].title
                    audioplayer.src = playList[0].url
                    audioplayer.loop = isLoop
                    audioplayer.volume = volume
                    audioplayer.play()
                    currentPlaying = playList[0]
                    isPlaying = true
                }

                const deleteEvent = async () => {
                    const playListTitle = Array.from(document.getElementsByClassName('listTitle'))
                    const playListDelete = Array.from(document.getElementsByClassName('listDelete'))
                    console.log(playListTitle)
                    const addPlayOnList = (play) => {
                        return new Promise((resolve, reject) => {
                            play.addEventListener("click", function () {
                                var i = play.id.split('title')[1]
                                audioplayer.src = playList[i].url
                                audioplayer.pause()
                                audioplayer.currentTime = 0;
                                document.querySelector("#musicTitle").innerText = playList[i].title
                                audioplayer.play()
                                currentPlaying = play
                                document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                                isPlaying = true
                            })
                            
                            resolve()
                        })
                    }
                    const addDeleteOnList = (play) => {
                        return new Promise((resolve, reject) => {
                            play.addEventListener("click", function () {
                                if(confirm("정말 삭제하시겠습니까?")){
                                    var i = play.id.split('delete')[1]
                                    playList.splice(i, 1)
                                    localStorage.setItem('playList', JSON.stringify(playList))
                                    document.querySelector("#playList").innerHTML = ''
                                    deleteEvent();
                                }else{
                                    alert("취소하였습니다.");
                                }
                            })
                            
                            resolve()
                        })
                    }
                    for await (let play of playListTitle) {
                        await addPlayOnList(play)
                    }
                    for await (let play of playListDelete) {
                        await addDeleteOnList(play)
                    }
    
                }

                deleteEvent()

                document.querySelector('#addList').addEventListener("click", function () {
                    playList.push({title: addTitle.value, url: addUrl.value})
                    document.querySelector("#playList").innerHTML = ''
                    deleteEvent();
                    console.log(playList)
                    localStorage.setItem('playList', JSON.stringify(playList))
                    if (playList.length == 1) {
                        document.querySelector("#musicTitle").innerText = playList[0].title
                        audioplayer.src = playList[0].url
                        audioplayer.loop = isLoop
                        audioplayer.volume = volume
                        audioplayer.play()
                        currentPlaying = playList[0]
                        isPlaying = true
                    }
                })

                document.querySelector('.shuffleButton').addEventListener("click", function () {
                    if (isShuffle) {
                        isShuffle = false
                        document.querySelector(".shuffleButton").innerHTML = "<i class='bx bx-shuffle' style='color: white;' ></i>"
                    } else {
                        isShuffle = true
                        sPlayList = playList
                        .map(value => ({ value, sort: Math.random() }))
                        .sort((a, b) => a.sort - b.sort)
                        .map(({ value }) => value)
                        document.querySelector(".shuffleButton").innerHTML = "<i class='bx bx-shuffle' style='color:#ff9899;' ></i>"
                    }
                })


                const timeAudio = () => {
                    const duration = audioplayer.duration || 0;
                    const timeBar = document.querySelector('#duration')
                    const totTime = document.querySelector('#totTime')
                    const playTime = document.querySelector('#playTime')
                    const tick = duration / 100
                    //전체시간 표시
                    // 음원 총 재생시간 구하기
                    const min = Math.floor(duration / 60);
                    const sec = Math.floor(duration % 60);
                    const totMin = min.toString().padStart(2, "0");
                    const totSec = sec.toString().padStart(2, "0");
                    totTime.innerText = `${totMin}:${totSec}`

                    // 현재시간 표시
                    audioplayer.addEventListener("timeupdate", (event) => {
                        //const playTime = $(".current");
                        let ctTime = parseInt(audioplayer.currentTime)
                        // 프로그레스 바 업데이트
                        timeBar.value = `${ctTime / tick}`

                        let min = Math.floor(ctTime / 60);
                        let sec = Math.floor(ctTime % 60);
                        let ctMin = min.toString().padStart(2, "0");
                        let ctSec = sec.toString().padStart(2, "0");
                        playTime.innerText = `${ctMin}:${ctSec}`
                    })

                    timeBar.addEventListener("change", (event) => {
                        audioplayer.currentTime = parseInt(event.target.value)*tick
                    });
                }

                audioplayer.onloadeddata = function(){
                    timeAudio(); 
                }

                audioplayer.addEventListener("ended", (event) => {
                    if(isShuffle) {
                        var nextIndex = (sPlayList.indexOf(currentPlaying) + 1) % sPlayList.length
                        audioplayer.src = sPlayList[nextIndex].url
                        document.querySelector("#musicTitle").innerText = sPlayList[nextIndex].title
                        audioplayer.play()
                        currentPlaying = sPlayList[nextIndex]
                    } else {
                        var nextIndex = (playList.indexOf(currentPlaying) + 1) % playList.length
                        audioplayer.src = playList[nextIndex].url
                        document.querySelector("#musicTitle").innerText = playList[nextIndex].title
                        audioplayer.play()
                        currentPlaying = playList[nextIndex]
                    }
                });

                document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                
                document.querySelector(".playButton").addEventListener("click", function () {
                    if (isPlaying) {
                        audioplayer.pause()
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-play' ></i>"
                        isPlaying = false
                    } else {
                        audioplayer.play()
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                        isPlaying = true
                    }
                })
        
                document.querySelector(".stopButton").addEventListener("click", function () {
                    if (isPlaying) {
                        audioplayer.pause()
                        audioplayer.currentTime = 0;
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-play' ></i>"
                        isPlaying = false
                    }
                })

                document.querySelector(".loopButton").addEventListener("click", function () {
                    if (isLoop) {
                        isLoop = false
                        audioplayer.loop = isLoop
                        document.querySelector(".loopButton").innerHTML = "<i class='bx bx-revision' style='color: white;' ></i>"
                    } else {
                        isLoop = true
                        audioplayer.loop = isLoop
                        document.querySelector(".loopButton").innerHTML = "<i class='bx bx-revision' style='color:#ff9899;' ></i>"
                    }
                })
    
                document.querySelector("#volume").addEventListener("change", (event) => {
                    audioplayer.volume = parseInt(event.target.value)/100
                });

            }
        })
    } else if (list) {

        var playList = [] //json

        var isShuffle = false
        var isPlaying = false
        var isLoop = false
        var volume = 1;
        var currentPlaying = {}

        fetch(list, {mode: 'no-cors'})
        .then(res => res.text())
        .then((out) => {
            console.log(out)
            out = out.split('\n')
            for (var i=0; i<out.length; i++) {
                out[i] = out[i].split(',')
                playList.push({title: out[i][0], url: out[i][1]})
            }

            document.querySelector('body').addEventListener("click", function () {
                if (!document.querySelector("audio")) {

                    document.querySelector("#player-box").innerHTML = '<audio style="display:none;" ></audio><div id="musicTitle"></div><div id="playbar"><div id="playTime"></div><div><input type="range" id="duration" class="rangeInput" name="duration" min="0" max="100" value="0" /></div><div id="totTime"></div></div><div id="player"><div class="playButton"><i class="bx bx-play" ></i></div><div class="stopButton"><i class="bx bx-stop" ></i></div><div class="loopButton"><i class="bx bx-revision" style="color:#ff9899;" ></i></div><div class="shuffleButton"><i class="bx bx-shuffle" ></i></div><div><label for="volume"><i class="bx bxs-megaphone" ></i> </label><input type="range" class="rangeInput" id="volume" name="volume" min="0" max="100" value="100" /></div></div></div>'

                    document.querySelector("#pdf-box").innerHTML = '<div id="form"><input type="text" class="textInput" id="addUrl" placeholder="재생목록에 추가할 음원 URL" /><input type="text" class="textInput" id="addTitle" placeholder="구분할 수 있는 제목" /><div id="addList">추가</div></div><div id="playList"></div>'

                    for (let i = 0; i<playList.length; i++) {
                        document.querySelector("#playList").innerHTML +='<div class="listUrl"><div class="listTitle" id="title'+i+'">'+playList[i].title+'</div></div>'
                        console.log(i)
                    }

                    var addUrl = document.querySelector('#addUrl')
                    var addTitle = document.querySelector('#addTitle')

                    var audioplayer = document.querySelector("audio")
                    if (playList.length > 0) {
                        document.querySelector("#musicTitle").innerText = playList[0].title
                        audioplayer.src = playList[0].url
                        audioplayer.loop = isLoop
                        audioplayer.volume = volume
                        audioplayer.play()
                        currentPlaying = playList[0]
                        isPlaying = true
                    }

                    const deleteEvent = async () => {
                        const playListTitle = Array.from(document.getElementsByClassName('listTitle'))
                        console.log(playListTitle)
                        const addPlayOnList = (play) => {
                            return new Promise((resolve, reject) => {
                                play.addEventListener("click", function () {
                                    var i = play.id.split('title')[1]
                                    audioplayer.src = playList[i].url
                                    audioplayer.pause()
                                    audioplayer.currentTime = 0;
                                    document.querySelector("#musicTitle").innerText = playList[i].title
                                    audioplayer.play()
                                    currentPlaying = play
                                    document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                                    isPlaying = true
                                })
                                
                                resolve()
                            })
                        }
                        for await (let play of playListTitle) {
                            await addPlayOnList(play)
                        }
        
                    }

                    deleteEvent()

                    document.querySelector('#addList').addEventListener("click", function () {
                        playList.push({title: addTitle.value, url: addUrl.value})
                        document.querySelector("#playList").innerHTML = ''
                        deleteEvent();
                        console.log(playList)
                        if (playList.length == 1) {
                            document.querySelector("#musicTitle").innerText = playList[0].title
                            audioplayer.src = playList[0].url
                            audioplayer.loop = isLoop
                            audioplayer.volume = volume
                            audioplayer.play()
                            currentPlaying = playList[0]
                            isPlaying = true
                        }
                    })

                    document.querySelector('.shuffleButton').addEventListener("click", function () {
                        if (isShuffle) {
                            isShuffle = false
                            document.querySelector(".shuffleButton").innerHTML = "<i class='bx bx-shuffle' style='color: white;' ></i>"
                        } else {
                            isShuffle = true
                            sPlayList = playList
                            .map(value => ({ value, sort: Math.random() }))
                            .sort((a, b) => a.sort - b.sort)
                            .map(({ value }) => value)
                            document.querySelector(".shuffleButton").innerHTML = "<i class='bx bx-shuffle' style='color:#ff9899;' ></i>"
                        }
                    })


                    const timeAudio = () => {
                        const duration = audioplayer.duration || 0;
                        const timeBar = document.querySelector('#duration')
                        const totTime = document.querySelector('#totTime')
                        const playTime = document.querySelector('#playTime')
                        const tick = duration / 100
                        //전체시간 표시
                        // 음원 총 재생시간 구하기
                        const min = Math.floor(duration / 60);
                        const sec = Math.floor(duration % 60);
                        const totMin = min.toString().padStart(2, "0");
                        const totSec = sec.toString().padStart(2, "0");
                        totTime.innerText = `${totMin}:${totSec}`

                        // 현재시간 표시
                        audioplayer.addEventListener("timeupdate", (event) => {
                            //const playTime = $(".current");
                            let ctTime = parseInt(audioplayer.currentTime)
                            // 프로그레스 바 업데이트
                            timeBar.value = `${ctTime / tick}`

                            let min = Math.floor(ctTime / 60);
                            let sec = Math.floor(ctTime % 60);
                            let ctMin = min.toString().padStart(2, "0");
                            let ctSec = sec.toString().padStart(2, "0");
                            playTime.innerText = `${ctMin}:${ctSec}`
                        })

                        timeBar.addEventListener("change", (event) => {
                            audioplayer.currentTime = parseInt(event.target.value)*tick
                        });
                    }

                    audioplayer.onloadeddata = function(){
                        timeAudio(); 
                    }

                    audioplayer.addEventListener("ended", (event) => {
                        if(isShuffle) {
                            var nextIndex = (sPlayList.indexOf(currentPlaying) + 1) % sPlayList.length
                            audioplayer.src = sPlayList[nextIndex].url
                            document.querySelector("#musicTitle").innerText = sPlayList[nextIndex].title
                            audioplayer.play()
                            currentPlaying = sPlayList[nextIndex]
                        } else {
                            var nextIndex = (playList.indexOf(currentPlaying) + 1) % playList.length
                            audioplayer.src = playList[nextIndex].url
                            document.querySelector("#musicTitle").innerText = playList[nextIndex].title
                            audioplayer.play()
                            currentPlaying = playList[nextIndex]
                        }
                    });

                    document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                    
                    document.querySelector(".playButton").addEventListener("click", function () {
                        if (isPlaying) {
                            audioplayer.pause()
                            document.querySelector(".playButton").innerHTML = "<i class='bx bx-play' ></i>"
                            isPlaying = false
                        } else {
                            audioplayer.play()
                            document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                            isPlaying = true
                        }
                    })
            
                    document.querySelector(".stopButton").addEventListener("click", function () {
                        if (isPlaying) {
                            audioplayer.pause()
                            audioplayer.currentTime = 0;
                            document.querySelector(".playButton").innerHTML = "<i class='bx bx-play' ></i>"
                            isPlaying = false
                        }
                    })

                    document.querySelector(".loopButton").addEventListener("click", function () {
                        if (isLoop) {
                            isLoop = false
                            audioplayer.loop = isLoop
                            document.querySelector(".loopButton").innerHTML = "<i class='bx bx-revision' style='color: white;' ></i>"
                        } else {
                            isLoop = true
                            audioplayer.loop = isLoop
                            document.querySelector(".loopButton").innerHTML = "<i class='bx bx-revision' style='color:#ff9899;' ></i>"
                        }
                    })
        
                    document.querySelector("#volume").addEventListener("change", (event) => {
                        audioplayer.volume = parseInt(event.target.value)/100
                    });

                }
            })
        })
    } else if (audio) {
        var isPlaying = false
        var isLoop = true
        var volume = 1;
        document.querySelector('body').addEventListener("click", function () {
            if (!document.querySelector("audio")) {

                document.querySelector("#player-box").innerHTML = '<audio style="display:none;" ><source src="'+audio+'" /></audio><div id="playbar"><div id="playTime"></div><div><input type="range" id="duration" class="rangeInput" name="duration" min="0" max="100" value="0" /></div><div id="totTime"></div></div><div id="player"><div class="playButton"><i class="bx bx-play" ></i></div><div class="stopButton"><i class="bx bx-stop" ></i></div><div class="loopButton"><i class="bx bx-x-circle" ></i></div><div><label for="volume"><i class="bx bxs-megaphone" ></i> </label><input type="range" class="rangeInput" id="volume" name="volume" min="0" max="100" value="100" /></div></div></div>'
                var audioplayer = document.querySelector("audio")
                audioplayer.loop = isLoop
                audioplayer.volume = volume
                audioplayer.play()
                isPlaying = true

                const timeAudio = () => {
                    const duration = audioplayer.duration || 0;
                    const timeBar = document.querySelector('#duration')
                    const totTime = document.querySelector('#totTime')
                    const playTime = document.querySelector('#playTime')
                    const tick = duration / 100
                    //전체시간 표시
                    // 음원 총 재생시간 구하기
                    const min = Math.floor(duration / 60);
                    const sec = Math.floor(duration % 60);
                    const totMin = min.toString().padStart(2, "0");
                    const totSec = sec.toString().padStart(2, "0");
                    totTime.innerText = `${totMin}:${totSec}`

                    // 현재시간 표시
                    audioplayer.addEventListener("timeupdate", (event) => {
                        //const playTime = $(".current");
                        let ctTime = parseInt(audioplayer.currentTime)
                        // 프로그레스 바 업데이트
                        timeBar.value = `${ctTime / tick}`

                        let min = Math.floor(ctTime / 60);
                        let sec = Math.floor(ctTime % 60);
                        let ctMin = min.toString().padStart(2, "0");
                        let ctSec = sec.toString().padStart(2, "0");
                        playTime.innerText = `${ctMin}:${ctSec}`
                    })

                    timeBar.addEventListener("change", (event) => {
                        audioplayer.currentTime = parseInt(event.target.value)*tick
                    });
                }

                audioplayer.onloadeddata = function(){
                    timeAudio(); 
                }

                document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                
                document.querySelector(".playButton").addEventListener("click", function () {
                    if (isPlaying) {
                        audioplayer.pause()
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-play' ></i>"
                        isPlaying = false
                    } else {
                        audioplayer.play()
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                        isPlaying = true
                    }
                })
        
                document.querySelector(".stopButton").addEventListener("click", function () {
                    if (isPlaying) {
                        audioplayer.pause()
                        audioplayer.currentTime = 0;
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-play' ></i>"
                        isPlaying = false
                    }
                })

                document.querySelector(".loopButton").addEventListener("click", function () {
                    if (isLoop) {
                        isLoop = false
                        audioplayer.loop = isLoop
                        document.querySelector(".loopButton").innerHTML = "<i class='bx bx-revision' ></i>"
                    } else {
                        isLoop = true
                        audioplayer.loop = isLoop
                        document.querySelector(".loopButton").innerHTML = "<i class='bx bx-x-circle' ></i>"
                    }
                })
    
                document.querySelector("#volume").addEventListener("change", (event) => {
                    audioplayer.volume = parseInt(event.target.value)/100
                });
            }
            
        })
    }
    if (pdf) { 
        document.querySelector('#pdf-box').innerHTML = '<embed class="pdf" src="'+pdf+'" type="application/pdf" />'
    }
})