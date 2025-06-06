const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const groupFolderPath = path.join(__dirname, "storage", "groupList");


// Method to get a group with given groupId
function get(groupId) {
    try {
      const filePath = path.join(groupFolderPath, `${groupId}.json`);
      const fileData = fs.readFileSync(filePath, "utf8");
      return JSON.parse(fileData);
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw { code: "failedToReadGroup", category: error.category };
    }
  }

// Method to create a group
function create(group) {
  try {
    const groupList = list();
    if (groupList.some((item) => item.title === group.title)) {
      throw {
        code: "uniqueNameAlreadyExists",
        message: "exists group with given title",
      };
    }
    group.id = crypto.randomBytes(16).toString("hex");
    const filePath = path.join(groupFolderPath, `${group.id}.json`);
    const fileData = JSON.stringify(group);
    fs.writeFileSync(filePath, fileData, "utf8");
    return group;
  } catch (error) {
    throw { code: "failedToCreategroup", group: error };
  }
}



// Method to list groups in a folder
function list() {
  try {
    const files = fs.readdirSync(groupFolderPath);
    const groupList = files.map((file) => {
      const fileData = fs.readFileSync(
        path.join(groupFolderPath, file),
        "utf8"
      );
      return JSON.parse(fileData);
    });
    return groupList;
  } catch (error) {
    throw { code: "failedToListgroups", group: error.group };
  }
}

// Method to update group in a file
function update(group) {
  try {
    const currentGroup = get(group.id);
    if (!currentGroup) return null;

    if (group.title && group.title !== currentGroup.title) {
      const groupList = list();
      if (groupList.some((item) => item.title === group.title)) {
        throw {
          code: "uniqueNameAlreadyExists",
          message: "exists group with given name",
        };
      }
    }

    const newGroup = { ...currentGroup, ...group };
    const filePath = path.join(groupFolderPath, `${group.id}.json`);
    const fileData = JSON.stringify(newGroup);
    fs.writeFileSync(filePath, fileData, "utf8");
    return newGroup;
  } catch (error) {
    throw { code: "failedToUpdategroup", group: error };
  }
}

// Method to remove an category from a file
function remove(groupId) {
  try {
    const filePath = path.join(groupFolderPath, `${groupId}.json`);
    fs.unlinkSync(filePath); // deletes a file
    return {};
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw { code: "failedToRemoveGroup", group: error.group };
  }
}

module.exports = {
  get,
  create,
  list,
  update,
  remove,
};
