export default function supportsProtoAssignment(entity) {
  return !!entity && (entity.__proto__ instanceof Object)
};
