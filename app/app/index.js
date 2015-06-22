import bus from 'bus';

import { dom } from 'deku';
import CardAnswers from '../card-answers';
import CardForm from '../card-form';

var propTypes = {
  card: { source: 'card' }
};

function render(component) {
  let { props, state } = component;
  let { card } = props;

  function getCard() {
    bus.emit('cards:get');
  }

  if (!card) {
    return (
      <span>loading</span>
    );
  }

  var thumbnails = (card.thumbs || []).map(thumb => {
    return <div class="App-thumb"><img src={thumb} alt="" class="App-image App-image--inline" /></div>;
  });

  return (
      <div class="App">
        <div class="App-content">
          <figure class="App-section">
            <img src={card.img} alt="" class="App-image" />
            <div class="App-thumbnails">
              {thumbnails}
            </div>
          </figure>
        </div>
        <div class="App-content App-content--main">
          <div class="App-section">
            <article class="Card">
              {!card.answers ? <CardForm card={card} /> : <CardAnswers card={card} />}
              <button class="Card-button Card-button--next" onClick={getCard} title="Get a new card">
                <span class="Card-buttonText">&rsaquo;</span>
              </button>
            </article>
          </div>
        </div>
      </div>
  );
}

export default { propTypes, render };
