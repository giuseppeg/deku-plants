import bus from 'bus';

import Cards from './data';

export default function plugin() {
  return function (app) {
    var cards = new Cards();

    function gimmeCard() {
      return cards.random();
    }

    cards.on('card:async-ready', card => app.set('card', card));
    cards.on('loaded', list => {
      app.set('card', gimmeCard());

      bus.on('cards:validate', answer => app.set('card', cards.validate(answer)));

      bus.on('cards:get', () => app.set('card', gimmeCard()));
      bus.on('cards:clear', () => cards.clear());

      bus.on('card:remove', x => cards.mark(x));
      bus.on('card:recover', x => cards.unmark(x));
    });

    cards.load();
  };
};
