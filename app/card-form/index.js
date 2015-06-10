import bus from 'bus';
import serialize from 'form-serialize';

import { dom } from 'deku';

var propTypes = {
  card: { source: 'card' }
};

function render({ props }) {
  let { card } = props;

  function validate(event) {
    event.preventDefault();
    bus.emit('cards:validate', serialize(event.target, { hash: true }));
  }

  var questions = card.questions.map((question) => {
    return [
      '<label class="Card-field">',
        question.q,
        '<input type="text" name="questions[' + question.id + ']" class="Card-input" autocomplete="off" placeholder="eg. dunno" />',
      '</label>'
    ].join('');
  }).join('');

  return (
    <form method="POST" onSubmit={validate}>
      <fieldset class="Card-fieldset">
        <label class="Card-field">
          <span class="Card-family">family</span>
          <input type="text" name="family" class="Card-input" autocomplete="off" required autofocus placeholder="eg. Adoxaceae" />
        </label>
        <label class="Card-field">
          <span class="Card-name">name</span>
          <input type="text" name="name[name]" class="Card-input" autocomplete="off" required placeholder="eg. Sambucus nigra" />
        </label>
        <label class="Card-field">
          <span class="Card-familyDetauls">german name</span>
          <input type="text" name="name[german name]" class="Card-input" autocomplete="off" required placeholder="eg. schwarzer holunder" />
        </label>
      </fieldset>
      <fieldset class="Card-fieldset" innerHTML={questions}>
      </fieldset>
      <input type="hidden" name="id" value={card.id} />
      <div class="Card-field">
        <button class="Card-button" title="will you answer be good?">validate</button>
      </div>
    </form>    
  );
}

export default { propTypes, render };
