
function placeholder(text,delimiter) {
  if(!text)return "";
  const textData = camelize(text)
  return delimiter +(textData.replace(/[^a-z0-9]+/ig, '')) + delimiter;
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}