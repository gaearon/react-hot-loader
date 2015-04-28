import makeHotify from './makeHotify';

const hotifiers = {};

export default function getHotify(uniqueClassId) {
  if (!hotifiers[uniqueClassId]) {
    hotifiers[uniqueClassId] = makeHotify();
  }

  return hotifiers[uniqueClassId];
}