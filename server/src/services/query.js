// We want to use dafault limit with 0 value, because if the user does not pass this argument
// we will want to return ALL the results without limit. Mongoose does exactly that when the
// limit is set as zero.
const DEFAULT_PAGE_LIMIT = 0;
const DEFAULT_PAGE_NUMBER = 1;

// since mongoose does not provide us pagination (although yes limit), we
// can create a function withnthe provided skip function to get our pagination
// skip is gonna have as argument the number of docks we want to skip before apply
// the limit, so with some maths ==> (page - 1) * limit <==  we can calculage the page
function getPagination(query) {
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  };
}

module.exports = {
  getPagination,
};
