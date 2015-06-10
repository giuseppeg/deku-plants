import clone from 'clone';
import Emitter from 'events';
import xhr from 'xhr';

if (typeof window !== 'undefined') var localStorage = window.localStorage;

const STORAGE_KEYS = {
  LIST: 'deku-cards-list',
  USED: 'deku-cards-used'
};
const IMAGE_PATH = 'images/';
var used = []

export default class Cards extends Emitter {
  constructor() {
    super();
  }

  load() {
    var data;

    if (localStorage) {
      data = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIST));    
      data = data && data.length ? data : null;
      used = JSON.parse(localStorage.getItem(STORAGE_KEYS.USED));
      used = used && used.length ? used : [];
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
      uri: "./data.json"
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
    return random;
  }

  validate(answer) {
    var correct = this.get(c => c.id == answer.id);
    
    if (!correct.length) {
      alert('Oops... question not found, loading a new card');
      return this.random();
    }

    correct = correct.shift();
    this.mark(correct);

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
          question: 'name',
          answer: correct.name["german name"],
          answered: answer.name["german name"]  || 'not answered',
          correct: correct.name["german name"] === answer.name["german name"]
        }
      ]
    };

    ret.answers = ret.answers.concat(
      correct.questions.map(question => {
        var answered = Object.keys(answer.questions).filter(id => +id === question.id);

        if (answered.length == 0) {
          return;
        }

        answered = answer.questions[answered];

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
