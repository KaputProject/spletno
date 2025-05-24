function isOwner(resource, user) {
    return resource.user._id.toString() === user._id.toString();
}

module.exports = {
    isOwner
};