import { dom } from 'deku';

var propTypes = {
  answer: { source: 'object' }
};

function render({ props }) {
  let { answer } = props;

  var containerClassname = [
    'Card-field',
    'Card-field--answer',
    'Card-field--' + (answer.correct ? 'valid' : 'invalid')
  ].join(' ');

  var elemCalssname = 'Card-answered Card-answered--' + answer.question.split(' ').map((word, i) => {
    word = word.toLowerCase();

    if (i == 0) {
      return word;
    }

    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join('');

  return (
    <div class={containerClassname}>
      <span class="Card-field">{answer.question}</span>
      <span class={elemCalssname}>{answer.answered}</span>
      <span class="Card-answer">{answer.answer}</span>
    </div>
  );
}

export default { propTypes, render };
