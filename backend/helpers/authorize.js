function isOwner(resource, user) {
    return resource.user.toString() === user._id.toString();
}

module.exports = {
    isOwner
};