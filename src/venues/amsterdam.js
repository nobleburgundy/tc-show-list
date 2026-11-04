// Amsterdam Bar & Hall, downtown St. Paul. RHP Events list page.
import { rhpShows } from '../sources/rhp.js';

const LIST = 'https://events.amsterdambarandhall.com/';

export default {
  id: 'amsterdam',
  name: 'Amsterdam Bar & Hall',
  area: 'St. Paul',
  url: LIST,
  shows: (date) => rhpShows(LIST, date),
};
