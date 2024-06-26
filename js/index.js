
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
var sheet = qs.s
var list = qs.list

var playList = [] //json
var sPlayList = []
var audioplayer
var isShuffle = false
var isPlaying = false
var isLoop = true
var volume = 1;
var currentPlaying = {}

const playBarContoller = function () {
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
            if (pdf && sheet) {
                var pdfHeight = (document.querySelector('.pdf').offsetWidth - 15) * 1.41 * sheet
                document.querySelector('.pdf').style="height: "+pdfHeight+"px;"
                var ctHeight = Math.max(ctTime / duration * pdfHeight - (document.querySelector('#pdf-box').offsetHeight)/2, 0)
                document.querySelector('#pdf-box').scrollTo(0,ctHeight)
            }

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
}

const playerController = function () {
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

    document.querySelector('body').addEventListener("keydown", (event) => {
        if (event.key == ' ' || event.key == 'Spacebar' || event.keyCode == 32) {
            if (isPlaying) {
                audioplayer.pause()
                document.querySelector(".playButton").innerHTML = "<i class='bx bx-play' ></i>"
                isPlaying = false
            } else {
                audioplayer.play()
                document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                isPlaying = true
            }
        }
    });

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

const shuffleController = function () {
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

    audioplayer.addEventListener("ended", (event) => {
        if(isShuffle) {
            var currentIndex = sPlayList.indexOf(currentPlaying)
            var nextIndex = (currentIndex + 1) % sPlayList.length
            if (!isLoop && nextIndex != currentIndex) {
                audioplayer.pause()
                audioplayer.currentTime = 0
            } else {
                audioplayer.src = sPlayList[nextIndex].url
                document.querySelector("#musicTitle").innerText = sPlayList[nextIndex].title
                audioplayer.play()
                currentPlaying = sPlayList[nextIndex]
            }
        } else {
            var currentIndex = playList.indexOf(currentPlaying)
            var nextIndex = (currentIndex + 1) % playList.length
            if (!isLoop && nextIndex != currentIndex) {
                audioplayer.pause()
                audioplayer.currentTime = 0
            } else {
                audioplayer.src = playList[nextIndex].url
                document.querySelector("#musicTitle").innerText = playList[nextIndex].title
                audioplayer.play()
                currentPlaying = playList[nextIndex]
            }
        }
    })
}

addEventListener("DOMContentLoaded", (event) => {
    if (!audio && !list) {
        document.querySelector('#player-box').innerHTML = "<h2>로컬 플레이리스트</h2>"
        document.querySelector('#player-box').innerHTML += "<div class='justText'>https://player.peacht.art/<span>?list=local</span></div><div class='justText'>"
        document.querySelector('#player-box').innerHTML += "<div class='form'><a href='./?list=local'><div id='goLocalList'>바로가기</div></a></div>"
        document.querySelector('#player-box').innerHTML += "위 URL로 접속하시면 온라인상의 음원만으로 구성된 로컬 플레이리스트를 만드실 수 있습니다.</div>"
        document.querySelector('#player-box').innerHTML += "<h2>리모트 플레이리스트</h2>"
        document.querySelector('#player-box').innerHTML += "<p></p><div class='justText'>https://player.peacht.art/<span>?list={리스트 주소}</span></div>"
        document.querySelector('#player-box').innerHTML += "<div class='form'><input type='text' class='textInput' id='addListUrl' placeholder='리스트 주소' /><a href='./' id='goRemoteList'><div>바로가기</div></a></div>"
        document.querySelector('#player-box').innerHTML += "<div class='justText'>위 URL로 접속하시면 다른 사람과 공유된 리스트에 접근하실 수 있습니다.</div>"
        document.querySelector('#player-box').innerHTML += "<h2>악보 모니터링</h2>"
        document.querySelector('#player-box').innerHTML += "<p></p><div class='justText'>https://player.peacht.art/<span>?a={오디오 파일 주소}&p={악보 PDF 주소}</span></div>"
        document.querySelector('#player-box').innerHTML += "<div class='form'><input type='text' class='textInput' id='addAudio' placeholder='오디오 파일 주소' /><input type='text' class='textInput' id='addPdf' placeholder='악보 PDF 주소' /><a href='./' id='goPlayer'><div>바로가기</div></a></div>"
        document.querySelector('#player-box').innerHTML += "<div class='justText'>위 URL로 접속하시면 온라인상의 아무 음원(일단 미스키 드라이브에 있는 건 가능)이나 플레이어로 감싸서 + 악보와 함께 듣거나 공유하실 수 있습니다.</div>"

        document.querySelector('#addListUrl').addEventListener("change", (event) => {
            var qs0 = document.querySelector('#addListUrl').value
            document.querySelector('#goRemoteList').setAttribute("href", './?list='+qs0)
        })
        document.querySelector('#addAudio').addEventListener("change", (event) => {
            var qs1 = document.querySelector('#addAudio').value
            var qs2 = document.querySelector('#addPdf').value
            document.querySelector('#goPlayer').setAttribute("href", './?a='+qs1+'&p='+qs2)
        })
        document.querySelector('#addPdf').addEventListener("change", (event) => {
            var qs1 = document.querySelector('#addAudio').value
            var qs2 = document.querySelector('#addPdf').value
            document.querySelector('#goPlayer').setAttribute("href", './?a='+qs1+'&p='+qs2)
        })

    } else if (list == 'local') {
        
        if (localStorage.getItem('playList')) {
            playList = JSON.parse(localStorage.getItem('playList'))
            sPlayList = playList
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
        }
        
        document.querySelector('body').addEventListener("click", function () {
            if (!document.querySelector("audio")) {

                function refreshList() {
                    document.querySelector("#playList").innerHTML = ''
                    for (let i = 0; i<playList.length; i++) {
                        document.querySelector("#playList").innerHTML +='<div class="listUrl"><div class="listTitle" id="title'+i+'">'+playList[i].title+'</div><div class="listDelete" id="delete'+i+'"><i class="bx bx-x"></i></div></div>'
                    }
                }

                document.querySelector("#player-box").innerHTML = '<audio style="display:none;" ></audio><div id="musicTitle"></div><div id="playbar"><div id="playTime"></div><div><input type="range" id="duration" class="rangeInput" name="duration" min="0" max="100" value="0" /></div><div id="totTime"></div></div><div id="player"><div class="playButton"><i class="bx bx-play" ></i></div><div class="stopButton"><i class="bx bx-stop" ></i></div><div class="loopButton"><i class="bx bx-revision" style="color:#ff9899;" ></i></div><div class="shuffleButton"><i class="bx bx-shuffle" ></i></div><div><label for="volume"><i class="bx bxs-megaphone" ></i> </label><input type="range" class="rangeInput" id="volume" name="volume" min="0" max="100" value="100" /></div></div></div>'

                document.querySelector("#pdf-box").innerHTML = '<div class="form"><input type="text" class="textInput" id="addUrl" placeholder="재생목록에 추가할 음원 URL" /><input type="text" class="textInput" id="addTitle" placeholder="구분할 수 있는 제목" /><div id="addList">추가</div></div><div id="playList"></div>'

                refreshList()

                var addUrl = document.querySelector('#addUrl')
                var addTitle = document.querySelector('#addTitle')

                audioplayer = document.querySelector("audio")
                if (playList.length > 0) {
                    document.querySelector("#musicTitle").innerText = playList[0].title
                    document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                    audioplayer.src = playList[0].url
                    audioplayer.volume = volume
                    audioplayer.play()
                    currentPlaying = playList[0]
                    isPlaying = true
                }
                const addEventOnList = async () => {
                    const playListTitle = Array.from(document.getElementsByClassName('listTitle'))
                    const playListDelete = Array.from(document.getElementsByClassName('listDelete'))
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
                                    refreshList()
                                    addEventOnList()
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

                addEventOnList()

                document.querySelector('#addList').addEventListener("click", function () {
                    playList.push({title: addTitle.value, url: addUrl.value})
                    refreshList()
                    addEventOnList()
                    localStorage.setItem('playList', JSON.stringify(playList))
                    if (playList.length == 1) {
                        document.querySelector("#musicTitle").innerText = playList[0].title
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                        audioplayer.src = playList[0].url
                        audioplayer.volume = volume
                        audioplayer.play()
                        currentPlaying = playList[0]
                        isPlaying = true
                    }
                })
                
                playBarContoller()
                playerController()
                shuffleController()
            }
        })
    } else if (list) {
        fetch(list, {mode: 'no-cors'})
        .then(res => res.text())
        .then((out) => {
            out = out.split('\n')
            for (var i=0; i<out.length; i++) {
                if (out[i] != '') {
                    out[i] = out[i].split(',')
                    playList.push({title: out[i][0], url: out[i][1]})
                }
            }

            sPlayList = playList
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)

            document.querySelector('body').addEventListener("click", function () {
                if (!document.querySelector("audio")) {

                    document.querySelector("#player-box").innerHTML = '<audio style="display:none;" ></audio><div id="musicTitle"></div><div id="playbar"><div id="playTime"></div><div><input type="range" id="duration" class="rangeInput" name="duration" min="0" max="100" value="0" /></div><div id="totTime"></div></div><div id="player"><div class="playButton"><i class="bx bx-play" ></i></div><div class="stopButton"><i class="bx bx-stop" ></i></div><div class="loopButton"><i class="bx bx-revision" style="color:#ff9899;" ></i></div><div class="shuffleButton"><i class="bx bx-shuffle" ></i></div><div><label for="volume"><i class="bx bxs-megaphone" ></i> </label><input type="range" class="rangeInput" id="volume" name="volume" min="0" max="100" value="100" /></div></div></div>'

                    document.querySelector("#pdf-box").innerHTML = '<div id="playList"></div>'

                    for (let i = 0; i<playList.length; i++) {
                        document.querySelector("#playList").innerHTML +='<div class="listUrl"><div class="listTitle" id="title'+i+'">'+playList[i].title+'</div></div>'
                    }

                    audioplayer = document.querySelector("audio")
                    if (playList.length > 0) {
                        document.querySelector("#musicTitle").innerText = playList[0].title
                        document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                        audioplayer.src = playList[0].url
                        audioplayer.volume = volume
                        audioplayer.play()
                        currentPlaying = playList[0]
                        isPlaying = true
                    }

                    const addEventOnList = async () => {
                        const playListTitle = Array.from(document.getElementsByClassName('listTitle'))
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

                    addEventOnList()

                    playBarContoller()
                    playerController()
                    shuffleController()
                }
            })
        })
    } else if (audio) {
        document.querySelector('body').addEventListener("click", function () {
            if (!document.querySelector("audio")) {

                document.querySelector("#player-box").innerHTML = '<audio style="display:none;" ><source src="'+audio+'" /></audio><div id="playbar"><div id="playTime"></div><div><input type="range" id="duration" class="rangeInput" name="duration" min="0" max="100" value="0" /></div><div id="totTime"></div></div><div id="player"><div class="playButton"><i class="bx bx-play" ></i></div><div class="stopButton"><i class="bx bx-stop" ></i></div><div class="loopButton"><i class="bx bx-revision" style="color:#ff9899;" ></i></div><div><label for="volume"><i class="bx bxs-megaphone" ></i> </label><input type="range" class="rangeInput" id="volume" name="volume" min="0" max="100" value="100" /></div></div></div>'
                audioplayer = document.querySelector("audio")
                audioplayer.loop = isLoop
                audioplayer.volume = volume
                audioplayer.play()
                document.querySelector(".playButton").innerHTML = "<i class='bx bx-pause'></i>"
                isPlaying = true

                playBarContoller()
                playerController()
            }
            
        })
    }
    if (pdf) { 
        document.querySelector('#pdf-box').innerHTML = '<iframe src="'+pdf+'" style="border: none;" class="pdf" >This browser does not support PDFs. Please download the PDF to view it: <a href="'+pdf+'">Download PDF</a></iframe>'
        var pdfFrame = document.querySelector('.pdf');
        pdfFrame.onload = function () {
            pdfFrame.contentWindow.scrollTo(0,100);
        }
    }
})