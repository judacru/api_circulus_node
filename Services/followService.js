const Follow = require("../models/follow");

const followUserIds = async (identityUserId) => {
    try {
        let following = await Follow.find({ "user": identityUserId }).select({ "followed": 1, "_id": 0 })

        let followers = await Follow.find({ "followed": identityUserId }).select({ "user": 1, "_id": 0 })

        let following_clean = [];
        let followers_clean = [];

        following.forEach(follow => {
            following_clean.push(follow.followed)
        });

        followers.forEach(follow => {
            followers_clean.push(follow.user)
        });

        return {
            following: following_clean,
            followers: followers_clean
        };
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar los usuarios.",
            error,
        });
    }
}

const followThisUser = async (identityUserId, profileUserId) => {
    let following = await Follow.findOne({ "user": identityUserId, "followed": profileUserId })

    let follower = await Follow.find({ "followed": identityUserId, "user": profileUserId })

    return {
        following,
        follower
    }
}

module.exports = {
    followUserIds,
    followThisUser
}