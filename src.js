/*
 * Copyright Aron Heinecke & others.
 *
 */


console.log("Boggled -- use login() to authenticate");
console.log("and runAll() to solve");

var tableArr = [];
var dictionaryParsed = undefined;
function getChars() {
    var table = document.getElementsByTagName('table')[0];
    tableArr = [];
    for ( var i = 0; i < table.rows.length; i++ ) {
        var subArr = [];
        subArr.push(table.rows[i].cells[0].innerHTML);
        subArr.push(table.rows[i].cells[1].innerHTML);
        subArr.push(table.rows[i].cells[2].innerHTML);
        subArr.push(table.rows[i].cells[3].innerHTML);
        tableArr.push(subArr.join(""));
        console.log(subArr.join(""));
    }
}

function combinations(str) {
    var fn = function(active, rest, a) {
        if (!active && !rest)
            return;
        if (!rest) {
            a.push(active);
        } else {
            fn(active + rest[0], rest.slice(1), a);
            fn(active, rest.slice(1), a);
        }
        return a;
    }
    return fn("", str, []);
}

function login() {
    var textBox = document.getElementsByTagName('input')[0];
    textBox.value = "proc's bot";
    textBox.dispatchEvent(new InputEvent('input'));
    textBox.dispatchEvent(new KeyboardEvent('keydown', {key: "Enter"}));
}

function runAll() {
    getChars();
    enterPossibilities();
}

function watch() {
    runAll();
    
    setTimeout(function() { // give the website time to send all stuff & make the word list
        var wordlist = document.getElementsByClassName('wordlist')[0];
        var observer = new MutationObserver( function() {
            console.log("detected new game");
            observer.disconnect(); // don't run on own call
            watch();
        });
        var config = { attributes: true, childList: true, subtree: true };
        observer.observe(wordlist, config);
    }, 5000);
}

function spam(amount) {
    if( amount == undefined ) {
        return;
    }
    getChars();
    var j = 0;
    var divider = amount / 10+1;
    var textBox = document.getElementsByTagName('input')[0];
    for(var j = 0; j < amount; j++) {
        if(j % divider == 0) {
            console.log(j % amount+"%");
        }
        var text = "";
        var possible = tableArr.join("");
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        textBox.value = text;
        textBox.dispatchEvent(new InputEvent('input'));
        textBox.dispatchEvent(new KeyboardEvent('keydown', {key: "Enter"}));
    }
}

function enterPossibilities() {
    var textBox = document.getElementsByTagName('input')[0];
    var x = 1;
    var y = 0;
    /*console.log("Loading dict..");
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
            if (xmlhttp.status == 200) {
                console.log("dict loaded");
                var resArr = xmlhttp.responseText.split("\n");
                var dict = new Set(resArr);
                dic = new Set([dict,Dictionary]); // hack, combine both for more dictionary per dictionary
                console.log("Dict parsed");*/
                if (dictionaryParsed == undefined) {
                    console.log("reading dictionary");
                    dictionaryParsed = new MakeTrie(Dictionary);
                }
                console.log("calculating solution");
                var results = BoggleWords(tableArr, dictionaryParsed);
                console.log(results);
                console.log("Amount: "+results.size);
                var counter = 0;
                for (let item of results) {
                    textBox.value = item;

                    textBox.dispatchEvent(new InputEvent('input'));
                    textBox.dispatchEvent(new KeyboardEvent('keydown', {key: "Enter"}));
                    counter++;
                }
            /*}
            else if (xmlhttp.status == 400) {
                alert('There was an error 400');
            }
            else {
                alert('dict error code:'+xmlhttp.status);
            }
        }
    };
    // https://raw.githubusercontent.com/dwyl/english-words/master/words.txt
    xmlhttp.open("GET", "https://raw.githubusercontent.com/dwyl/english-words/master/words.txt", true);
    xmlhttp.send();*/
}

var TrieNode = function (parent, value) {
    this.parent = parent;
    this.children = new Array(26);
    this.isWord = false;
    if (parent !== undefined) {
        parent.children[value.charCodeAt(0) - 97] = this;
    }
};
var MakeTrie = function (dict) {
    var root = new TrieNode(undefined, '');
    // console.log(root);
    for (let word of dict.values()) {
        var curNode = root;

        for (var i = 0; i < word.length; i++) {
            var letter = word[i];
            var ord = letter.charCodeAt(0);
            if (97 <= ord < 123) {
                // console.log(curNode);
                var nextNode = curNode.children[ord - 97];
                if (nextNode === undefined) {
                    nextNode = new TrieNode(curNode, letter);
                }
                curNode = nextNode;
            }
        }
        curNode.isWord = true;
    }
    return root;
};
var BoggleWords = function (grid, dict, mustHave) {
    var rows = grid.length;
    var cols = grid[0].length;
    var queue = [];
    var words = new Set();
    for (var y = 0; y < cols; y++) {
        for (var x = 0; x < rows; x++) {
            var c = grid[y][x];
            var ord = c.charCodeAt(0);
            var node = dict.children[ord - 97];
            if (node !== undefined) {
                queue.push([x, y, c, node, [[x, y]]]);
            }
        }
    }
    while (queue.length !== 0) {
        var [x, y, s, node, h] = queue.pop();
        for (let [dx, dy] of [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]]) {
            var [x2, y2] = [x + dx, y + dy];
            if (h.find(function (el) {
                    return el[0] === x2 && el[1] === y2;
                }) !== undefined) {
                continue;
            }
            // console.log(x2,y2, h);
            if (0 <= x2 && x2 < cols && 0 <= y2 && y2 < rows) {
                var newHist = h.slice();
                newHist.push([x2, y2]);
                var s2 = s + grid[y2][x2];
                var node2 = node.children[grid[y2][x2].charCodeAt(0) - 97];
                if (node2 !== undefined) {
                    // console.log(s2);
                    if (node2.isWord) {
                        if (mustHave === undefined || s2.indexOf(mustHave) !== -1)
                            words.add(s2);

                        // console.log(newHist, s2);
                    }
                    queue.push([x2, y2, s2, node2, newHist]);
                }
            }
        }
    }
    return words.values()
}
