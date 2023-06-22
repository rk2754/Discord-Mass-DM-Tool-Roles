/* * * * * * * * * * * * * * * * * 
*                                *
*           Mass DM              *
Author: 17teen with modifications by R.
*       Discord: r.dot.          *
*                                *
* * * * * * * * * * * * * * * * */

// Modules
const { Client } = require("discord.js");
const { red, yellow, greenBright, yellowBright } = require("chalk");
const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });
const fs = require("fs");
const targetRoleName = "INSERT ROLE NAME";

// Instance(s) & Settings
const client = new Client();
const { token, message } = require("./settings.json");

// When client is on
client.on("ready", () => {
    console.log(greenBright(client.user.tag + "is online.\n"));
    client.user.setActivity({ name: "dw about it", type: "dw about it", url: "dw about it" })
    Main();
});


function Main() {
    console.log("\tMass DM:\n\n\tOptions:\n    [1] Normal Mode\n    [2] Timeout Mode (Avoids Flagging)\n");
    readline.question("[?] Choose Option: ", answer => {
        switch (answer) {
            case "1":
                readline.question("\n[!] Enter Guild ID: ", response => {
                    readline.question("\n[!] Enter Message: ", message => {
                        ScrapeUsers(response).then(() => {
                            console.log(greenBright("Warning: Mass DMing Soon."));
                            setTimeout(() => {
                                MassDMNormal(null, message).catch(err => {
                                    console.log(err);
                                    setTimeout(() => {
                                        console.log(yellow("Warning: Restarting."));
                                    }, 1000);
                                    setTimeout(() => {
                                        process.exit(1);
                                    }, 2000);
                                });
                            }, 2000);
                        });
                    });
                });
                break;
            case "2":
                readline.question("\n[!] Enter Guild ID: ", response => {
                    readline.question("\n[!] Enter Message: ", message => {
                        ScrapeUsers(response).then(() => {
                            setTimeout(() => {
                                readline.question("\n[i] Set Timeout: The number of seconds the bot waits before it messages users.\n[i] Bypass: Avoids being flagged by Discord\n[i] Limit(s): 3 - 9 seconds\n\n[!] Enter Timeout: ", timeout => {
                                    if (timeout === "3" || timeout === "4" || timeout === "5" || timeout === "6" || timeout === "7" || timeout === "8" || timeout === "9") {
                                        const timer = parseInt(timeout) * 1000;
                                        console.log(greenBright("Warning: Mass DMing Soon."));
                                        MassDMTimeOut(timer, message).catch(err => {
                                            console.log(err);
                                            setTimeout(() => {
                                                console.log(yellow("Warning: Restarting."));
                                            }, 1000);
                                            setTimeout(() => {
                                                process.exit(1);
                                            }, 2000);
                                        });
                                    } else {
                                        console.log(red("Timeout Error: Invalid number was used to set a timeout."));
                                        setTimeout(() => {
                                            console.log(yellow("Warning: Restarting."));
                                        }, 1000);
                                        setTimeout(() => {
                                            process.exit(1);
                                        }, 2000);
                                    }
                                });
                            }, 2000);
                        });
                    });
                });
                break;
            default:
                console.log(red("Option Error: Incorrect option used."));
        }
    });
}


/**
 * Scrape Users
 * @param {string} guildID ID of gthe guild which to scrape the users from
 */
async function ScrapeUsers(guildID) {
    const guild = await client.guilds.fetch(guildID).catch((err) => {
        console.log(red("Fetching Guild Error: " + err));
        setTimeout(() => {
            console.log(yellow("Warning: Restarting."));
        }, 1000);
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    });

    const targetRole = guild.roles.cache.find(role => role.name === targetRoleName);
    if (!targetRole) {
        console.log(red("Role Error: The target role was not found."));
        setTimeout(() => {
            console.log(yellow("Warning: Restarting."));
        }, 1000);
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    }

    const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(targetRole.id));
    const memberIDs = membersWithRole.map(member => member.id);

    console.log(yellowBright("[!] " + memberIDs.length + " Users with the target role Scraped"));

    const data = {
        IDs: memberIDs
    };

    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync('./scraped.json', content, err => {
        if (err) {
            console.log(red("Writing File Error: " + err));
        } else {
            console.log(greenBright("Successfully created scraped.json"));
        }
    });
}


/**
 * Mass DM (Timeout Mode)
 * @param {array} users Array of users to Mass DM
 * @param {number} timeout Timeout number 
 * @param {string} msg Message you wish to be DM's to users
 */
function MassDMTimeOut(timeout, msg) {
    return new Promise((resolve, reject) => {
        const scraped = require("./scraped.json");
        const users = scraped.IDs;

        if (typeof timeout !== "number") {
            reject(red("Timeout Error: Wrong data type used."));
        } else if (typeof msg !== "string") {
            reject(red("Message Args Error: Must use 'string' data type."));
        } else {
            for (let i = 0; i < users.length; i++) {
                client.users.fetch(users[i]).then(u => {
                    setTimeout(() => {
                        u.send(msg).then(() => console.log(greenBright("User: " + u.tag + " messaged."))).catch(err => console.log(red("DM Error: User: " + u.tag + " may have DMs off. " + err)));
                    }, timeout * i);
                }).catch(err => console.log(red("Fetching User Error: " + err)));
            }
            resolve();
        }
    });
}

/**
 * Mass DM (Normal Mode)
 * @param {array} users Array of users to Mass DM
 * @param {string} msg Message you wish to be DM's to users
 */
function MassDMNormal(msg) {
    return new Promise((resolve, reject) => {
        const scraped = require("./scraped.json");
        const users = scraped.IDs;

        for (let i = 0; i < users.length; i++) {
            client.users.fetch(users[i]).then(u => {
                u.send(msg).then(() => console.log(greenBright("User: " + u.tag + " messaged."))).catch(err => console.log(red("DM Error: User: " + u.tag + " may have DMs off. " + err)));
            }).catch(err => console.log(red("Fetching User Error: " + err)));
        }
        resolve();
    });
}

// Client Logging in
client.login(token).catch((err) => { console.log("Token Error Found: " + err) });
