import clone from 'clone';
import Emitter from 'events';
import xhr from 'xhr';
import pkgInfo from '../../package.json';

if (typeof window !== 'undefined') var localStorage = window.localStorage;

const STORAGE_KEYS = {
  LIST: 'deku-cards-list',
  USED: 'deku-cards-used',
  VER: 'deku-cards-ver'
};
const IMAGE_PATH = 'images/';
const IMAGE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1?num=6&key=AIzaSyD1D_8NNgBe7LORWToys3sGbEmJ2uXeBTY&searchType=image&cx=006168986964877337084:gjmnc9m5axa&q={{qs}}%20plant';
var used = []

export default class Cards extends Emitter {
  constructor() {
    super();
  }

  load() {
    var data;

    if (localStorage) {
      let ver = localStorage.getItem(STORAGE_KEYS.VER);

      if (ver === pkgInfo.version) {
        data = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIST));
        data = data && data.length ? data : null;
        used = JSON.parse(localStorage.getItem(STORAGE_KEYS.USED));
        used = used && used.length ? used : [];
      }
    }

    var cb = function (data, fromCache) {
      if (!fromCache) {
        data.forEach((card, x) => {
          card.id = x;
          if (!card.img) {
            card.img = (card.name.name.replace(' ', '_', 'g') + '.jpg');
          }
          card.img = IMAGE_PATH + card.img;

          (card.questions || []).forEach((question, i) => {
            question.id = i;
          });
        });
      }
      this.list = data;
      this.emit('loaded', this.list);
      this.store();
    }.bind(this);

    if (data) {
      cb(data, true);
      return;
    }

    xhr({
      uri: "./data.json",
      timeout: 10000
    }, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return;
      }

      cb(JSON.parse(body), false);
    });
  }

  store() {
    this.emit('change');
    if (localStorage) {
      localStorage.setItem(STORAGE_KEYS.LIST, JSON.stringify(this.list));
      localStorage.setItem(STORAGE_KEYS.USED, JSON.stringify(used));
      localStorage.setItem(STORAGE_KEYS.VER, pkgInfo.version);
    }
  }

  // read

  get(filter) {
    var list = clone(this.list);
    return filter ? list.filter(filter) : list;
  }

  all() {
    return this.get();
  }

  random() {
    if (this.list.length == 0) {
      this.emit('no-cards');
    }

    var available = this.get(card => used.indexOf(card.id) === -1);

    if (!available.length) {
      alert('No cards left, starting over');
      this.clear();
      this.random();
    }

    var random = available[Math.floor(Math.random() * (available.length))];

    if (!random.thumbs) {
      this.getThumbnails(random);
      return;
    }

    return random;
  }

  getThumbnails(card) {
    var q = IMAGE_SEARCH_URL.replace('{{qs}}', encodeURIComponent(card.name.name));
    xhr({
      uri: q,
      timeout: 10000
    }, function (err, resp, body) {
      if (err || resp.statusCode !== 200) {
        card.thumbs = [];
      } else {
        try {
          body = JSON.parse(body);
        } catch (e) {
          body = {};
        }
        card.thumbs = (body.items || []).map(item => item.image.thumbnailLink);
      }
      this.store();
      this.emit('card:async-ready', card);
    }.bind(this));
  }

  validate(answer) {
    var correct = this.get(c => c.id == answer.id);

    if (!correct.length) {
      alert('Oops... question not found, loading a new card');
      return this.random();
    }

    correct = correct.shift();
    this.mark(correct);
    answer.name = answer.name || {};
    answer.questions = answer.questions || {};

    var ret = {
      id: correct.id,
      img: correct.img,
      answers: [
        {
          question: 'family',
          answer: correct.family,
          answered: answer.family || 'not answered',
          correct: correct.family === answer.family
        },
        {
          question: 'name',
          answer: correct.name.name,
          answered: answer.name.name  || 'not answered',
          correct: correct.name.name === answer.name.name
        },
        {
          question: 'german name',
          answer: correct.name["german name"],
          answered: answer.name["german name"]  || 'not answered',
          correct: correct.name["german name"] === answer.name["german name"]
        }
      ]
    };

    ret.answers = ret.answers.concat(
      correct.questions.map(question => {
        var answered = Object.keys(answer.questions).filter(id => +id === question.id);
        answered = answer.questions[answered] || 'not answered';

        return {
          question: question.q,
          answer: question.a,
          answered: answered,
          correct: (question.a.toLowerCase() == answered.toLowerCase())
        }
      }).filter(Boolean)
    );

    return ret;
  }

  mark(card) {
    this.toggle(card, true);
    return this;
  }

  unmark(card) {
    this.toggle(card, false);
    return this;
  }

  toggle(card, state) {
    var iof = used.indexOf(card.id);

    if (state) {
      if (iof !== -1) {
        used.splice(iof, 1, card.id);
      } else {
        used.push(card.id);
      }
    } else {
      (iof !== -1) && used.splice(iof, 1);
    }

    this.store();
  }

  clear() {
    used = [];
    if (!this.list || !this.list.length) {
      this.load();
    } else {
      this.store();
    }
  }
}
