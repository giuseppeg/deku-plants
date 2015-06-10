import { dom } from 'deku';
import Answer from '../card-answer';


var propTypes = {
  card: { source: 'card' }
};

function render({ props }) {
  let { card } = props;

  var answers = card.answers.map(answer => {
    return <Answer answer={answer} />;
  });

  return (
    <div class="Card-fieldset">{answers}</div>
  );
}

export default { propTypes, render };
