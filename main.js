const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fs = require('fs');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('./lib/index');

// Command imports
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { Antilink } = require('./lib/antilink');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { startHangman, guessLetter } = require('./commands/hangman');
const { startTrivia, answerTrivia } = require('./commands/trivia');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const welcomeCommand = require('./commands/welcome');
const goodbyeCommand = require('./commands/goodbye');
const githubCommand = require('./commands/github');
const { handleAntiBadwordCommand, handleBadwordDetection } = require('./lib/antibadword');
const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const pairCommand = require('./commands/pair');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const isOwner = require('./lib/isOwner');

// Global settings
global.packname = settings.packname;
global.author = settings.author;
global.channelLink = "https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A";
global.ytch = "Mr Unique Hacker";

// Add this near the top of main.js with other global configurations
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'KnightBot MD',
            serverMessageId: -1
        }
    }
};

// Function to check if a chat is a self-chat (user messaging themselves)
function isSelfChat(chatId, senderId, botNumber) {
    // Convert to standard format if needed
    const normalizedChatId = chatId.endsWith('@s.whatsapp.net') ? chatId : `${chatId.split('@')[0]}@s.whatsapp.net`;
    const normalizedSenderId = senderId.endsWith('@s.whatsapp.net') ? senderId : `${senderId.split('@')[0]}@s.whatsapp.net`;
    const normalizedBotNumber = botNumber.endsWith('@s.whatsapp.net') ? botNumber : `${botNumber.split('@')[0]}@s.whatsapp.net`;
    
    // Check if this is a self-chat (user messaging themselves)
    return normalizedChatId === normalizedSenderId && normalizedSenderId === normalizedBotNumber;
}

// Load owner number from settings and owner.json
function getOwnerNumbers() {
    try {
        // Get owner from settings
        const settingsOwner = settings.ownerNumber + "@s.whatsapp.net";
        
        // Get owners from owner.json
        const ownerJson = JSON.parse(fs.readFileSync('./data/owner.json'));
        const jsonOwners = ownerJson.map(num => num + "@s.whatsapp.net");
        
        // Combine and remove duplicates
        const allOwners = [...new Set([settingsOwner, ...jsonOwners])];
        return allOwners;
    } catch (error) {
        console.error("Error loading owner numbers:", error);
        // Fallback to settings owner only
        return [settings.ownerNumber + "@s.whatsapp.net"];
    }
}

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // Store message for antidelete feature
        if (message.message) {
            storeMessage(message);
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // ===== SECURITY MODIFICATION =====
        // Only allow interaction in self-chat (user messaging themselves)
        // This is the main security check that restricts the bot to only respond to self-chats
        if (!isSelfChat(chatId, botNumber, botNumber)) {
            // Silently ignore all messages not from self-chat
            return;
        }
        // ===== END SECURITY MODIFICATION =====

        let userMessage = message.message?.conversation?.trim().toLowerCase() ||
            message.message?.extendedTextMessage?.text?.trim().toLowerCase() || '';
        userMessage = userMessage.replace(/\.\s+/g, '.').trim();

        // Preserve raw message for commands like .tag that need original casing
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() || '';

        // Only log command usage
        if (userMessage.startsWith('.')) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }

        // Check if user is banned (skip ban check for unban command)
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            // Only respond occasionally to avoid spam
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ You are banned from using the bot. Contact an admin to get unbanned.',
                    ...channelInfo
                });
            }
            return;
        }

        // First check if it's a game move
        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        // Then check for command prefix
        if (!userMessage.startsWith('.')) {
            return;
        }

        // List of admin commands
        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.antilink'];
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));

        // List of owner commands
        const ownerCommands = ['.mode', '.autostatus', '.antidelete', '.cleartmp', '.setpp', '.clearsession', '.areact', '.autoreact'];
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        // Command handlers
        switch (true) {
            case userMessage === '.simage': {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) {
                    await simageCommand(sock, quotedMessage, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please reply to a sticker with the .simage command to convert it.', ...channelInfo });
                }
                break;
            }
            case userMessage.startsWith('.kick'):
                const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                break;
            case userMessage.startsWith('.mute'):
                const muteDuration = parseInt(userMessage.split(' ')[1]);
                if (isNaN(muteDuration)) {
                    await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes.\neg to mute 10 minutes\n.mute 10', ...channelInfo });
                } else {
                    await muteCommand(sock, chatId, senderId, muteDuration);
                }
                break;
            case userMessage === '.unmute':
                await unmuteCommand(sock, chatId, senderId);
                break;
            case userMessage.startsWith('.ban'):
                await banCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.unban'):
                await unbanCommand(sock, chatId, message);
                break;
            case userMessage === '.help' || userMessage === '.menu' || userMessage === '.bot' || userMessage === '.list':
                await helpCommand(sock, chatId, global.channelLink);
                break;
            case userMessage === '.sticker' || userMessage === '.s':
                await stickerCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.warnings'):
                const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warningsCommand(sock, chatId, mentionedJidListWarnings);
                break;
            case userMessage.startsWith('.warn'):
                const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                break;
            case userMessage.startsWith('.tts'):
                const text = userMessage.slice(4).trim();
                await ttsCommand(sock, chatId, text);
                break;
            case userMessage === '.delete' || userMessage === '.del':
                await deleteCommand(sock, chatId, message, senderId);
                break;
            case userMessage.startsWith('.attp'):
                await attpCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.mode'):
                // Check if sender is the owner
                if (!message.key.fromMe) {
                    await sock.sendMessage(chatId, { text: 'Only bot owner can use this command!', ...channelInfo });
                    return;
                }
                // Read current data first
                let data;
                try {
                    data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
                } catch (error) {
                    console.error('Error reading access mode:', error);
                    await sock.sendMessage(chatId, { text: 'Failed to read bot mode status', ...channelInfo });
                    return;
                }

                const action = userMessage.split(' ')[1]?.toLowerCase();
                // If no argument provided, show current status
                if (!action) {
                    const currentMode = data.isPublic ? 'public' : 'private';
                    await sock.sendMessage(chatId, {
                        text: `Current bot mode: *${currentMode}*\n\nUsage: .mode public/private\n\nExample:\n.mode public - Allow everyone to use bot\n.mode private - Restrict to owner only`,
                        ...channelInfo
                    });
                    return;
                }

                if (action !== 'public' && action !== 'private') {
                    await sock.sendMessage(chatId, {
                        text: 'Usage: .mode public/private\n\nExample:\n.mode public - Allow everyone to use bot\n.mode private - Restrict to owner only',
                        ...channelInfo
                    });
                    return;
                }

                try {
                    // Update access mode
                    data.isPublic = action === 'public';

                    // Save updated data
                    fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));

                    await sock.sendMessage(chatId, { text: `Bot is now in *${action}* mode`, ...channelInfo });
                } catch (error) {
                    console.error('Error updating access mode:', error);
                    await sock.sendMessage(chatId, { text: 'Failed to update bot access mode', ...channelInfo });
                }
                break;
            case userMessage === '.owner':
                await ownerCommand(sock, chatId);
                break;
            case userMessage === '.tagall':
                if (isSenderAdmin || message.key.fromMe) {
                    await tagAllCommand(sock, chatId, senderId);
                } else {
                    await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use the .tagall command.', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.tag'):
                const messageText = rawText.slice(4).trim();  // use rawText here, not userMessage
                const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await tagCommand(sock, chatId, senderId, messageText, replyMessage);
                break;
            case userMessage.startsWith('.antilink'):
                await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin);
                break;
            case userMessage === '.meme':
                await memeCommand(sock, chatId);
                break;
            case userMessage === '.joke':
                await jokeCommand(sock, chatId);
                break;
            case userMessage === '.quote':
                await quoteCommand(sock, chatId);
                break;
            case userMessage === '.fact':
                await factCommand(sock, chatId);
                break;
            case userMessage.startsWith('.weather'):
                const location = userMessage.slice(8).trim();
                if (!location) {
                    await sock.sendMessage(chatId, { text: 'Please provide a location.\nExample: .weather New York', ...channelInfo });
                } else {
                    await weatherCommand(sock, chatId, location);
                }
                break;
            case userMessage.startsWith('.news'):
                const category = userMessage.slice(5).trim() || 'general';
                await newsCommand(sock, chatId, category);
                break;
            case userMessage.startsWith('.tictactoe'):
                const opponent = message.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                await tictactoeCommand(sock, chatId, senderId, opponent);
                break;
            case userMessage === '.topmembers':
                await topMembers(sock, chatId);
                break;
            case userMessage.startsWith('.hangman'):
                await startHangman(sock, chatId, senderId);
                break;
            case userMessage.startsWith('.guess'):
                const letter = userMessage.slice(6).trim().charAt(0);
                if (letter) {
                    await guessLetter(sock, chatId, senderId, letter);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a letter to guess.\nExample: .guess a', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.trivia'):
                await startTrivia(sock, chatId, senderId);
                break;
            case userMessage.startsWith('.answer'):
                const answer = userMessage.slice(7).trim();
                if (answer) {
                    await answerTrivia(sock, chatId, senderId, answer);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide an answer.\nExample: .answer Paris', ...channelInfo });
                }
                break;
            case userMessage === '.compliment':
                await complimentCommand(sock, chatId);
                break;
            case userMessage === '.insult':
                await insultCommand(sock, chatId);
                break;
            case userMessage.startsWith('.8ball'):
                const question = userMessage.slice(6).trim();
                if (question) {
                    await eightBallCommand(sock, chatId, question);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please ask a question.\nExample: .8ball Will I win the lottery?', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.lyrics'):
                const song = userMessage.slice(7).trim();
                if (song) {
                    await lyricsCommand(sock, chatId, song);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a song name.\nExample: .lyrics Shape of You', ...channelInfo });
                }
                break;
            case userMessage === '.dare':
                await dareCommand(sock, chatId);
                break;
            case userMessage === '.truth':
                await truthCommand(sock, chatId);
                break;
            case userMessage === '.clear':
                await clearCommand(sock, chatId);
                break;
            case userMessage === '.ping':
                await pingCommand(sock, chatId);
                break;
            case userMessage === '.alive':
                await aliveCommand(sock, chatId);
                break;
            case userMessage.startsWith('.blur'):
                await blurCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.welcome'):
                await welcomeCommand(sock, chatId, userMessage, senderId);
                break;
            case userMessage.startsWith('.goodbye'):
                await goodbyeCommand(sock, chatId, userMessage, senderId);
                break;
            case userMessage.startsWith('.github'):
                const username = userMessage.slice(7).trim();
                if (username) {
                    await githubCommand(sock, chatId, username);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a GitHub username.\nExample: .github octocat', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.antibadword'):
                await antibadwordCommand(sock, chatId, userMessage, senderId);
                break;
            case userMessage.startsWith('.chatbot'):
                await handleChatbotCommand(sock, chatId, userMessage, senderId);
                break;
            case userMessage.startsWith('.take'):
                await takeCommand(sock, chatId, message);
                break;
            case userMessage === '.flirt':
                await flirtCommand(sock, chatId);
                break;
            case userMessage.startsWith('.character'):
                const characterName = userMessage.slice(10).trim();
                if (characterName) {
                    await characterCommand(sock, chatId, characterName);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a character name.\nExample: .character Iron Man', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.wasted'):
                await wastedCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.ship'):
                await shipCommand(sock, chatId, message);
                break;
            case userMessage === '.groupinfo':
                if (isGroup) {
                    await groupInfoCommand(sock, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo });
                }
                break;
            case userMessage === '.resetlink':
                if (isGroup) {
                    if (isSenderAdmin || message.key.fromMe) {
                        await resetlinkCommand(sock, chatId);
                    } else {
                        await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use this command.', ...channelInfo });
                    }
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo });
                }
                break;
            case userMessage === '.staff':
                if (isGroup) {
                    await staffCommand(sock, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.emojimix'):
                await emojimixCommand(sock, chatId, userMessage);
                break;
            case userMessage === '.viewonce':
                await viewOnceCommand(sock, chatId, message);
                break;
            case userMessage === '.clearsession':
                if (message.key.fromMe) {
                    await clearSessionCommand(sock, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'Only the bot owner can use this command.', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.autostatus'):
                if (message.key.fromMe) {
                    await autoStatusCommand(sock, chatId, userMessage);
                } else {
                    await sock.sendMessage(chatId, { text: 'Only the bot owner can use this command.', ...channelInfo });
                }
                break;
            case userMessage === '.simp':
                await simpCommand(sock, chatId, message);
                break;
            case userMessage === '.stupid':
                await stupidCommand(sock, chatId, message);
                break;
            case userMessage === '.pair':
                if (isGroup) {
                    await pairCommand(sock, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.stickertelegram'):
                const stickerName = userMessage.slice(17).trim();
                if (stickerName) {
                    await stickerTelegramCommand(sock, chatId, stickerName);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a sticker name.\nExample: .stickertelegram Pepe', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.textmaker'):
                await textmakerCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.antidelete'):
                if (message.key.fromMe) {
                    await handleAntideleteCommand(sock, chatId, userMessage);
                } else {
                    await sock.sendMessage(chatId, { text: 'Only the bot owner can use this command.', ...channelInfo });
                }
                break;
            case userMessage === '.cleartmp':
                if (message.key.fromMe) {
                    await clearTmpCommand(sock, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'Only the bot owner can use this command.', ...channelInfo });
                }
                break;
            case userMessage === '.setpp':
                if (message.key.fromMe) {
                    await setProfilePicture(sock, chatId, message);
                } else {
                    await sock.sendMessage(chatId, { text: 'Only the bot owner can use this command.', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.instagram'):
                const igUrl = userMessage.slice(10).trim();
                if (igUrl) {
                    await instagramCommand(sock, chatId, igUrl);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide an Instagram URL.\nExample: .instagram https://www.instagram.com/p/ABC123/', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.facebook'):
                const fbUrl = userMessage.slice(9).trim();
                if (fbUrl) {
                    await facebookCommand(sock, chatId, fbUrl);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a Facebook URL.\nExample: .facebook https://www.facebook.com/watch?v=123456789', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.play'):
                const query = userMessage.slice(5).trim();
                if (query) {
                    await playCommand(sock, chatId, query);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a song name.\nExample: .play Shape of You', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.tiktok'):
                const ttUrl = userMessage.slice(7).trim();
                if (ttUrl) {
                    await tiktokCommand(sock, chatId, ttUrl);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a TikTok URL.\nExample: .tiktok https://www.tiktok.com/@username/video/1234567890123456789', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.song'):
                const songQuery = userMessage.slice(5).trim();
                if (songQuery) {
                    await songCommand(sock, chatId, songQuery);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a song name.\nExample: .song Shape of You', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.ai'):
                const aiQuery = userMessage.slice(3).trim();
                if (aiQuery) {
                    await aiCommand(sock, chatId, aiQuery);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a question for AI.\nExample: .ai What is the capital of France?', ...channelInfo });
                }
                break;
            case userMessage.startsWith('.translate'):
                await handleTranslateCommand(sock, chatId, userMessage, message);
                break;
            case userMessage.startsWith('.ss'):
                await handleSsCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.areact'):
                if (message.key.fromMe) {
                    await handleAreactCommand(sock, chatId, userMessage);
                } else {
                    await sock.sendMessage(chatId, { text: 'Only the bot owner can use this command.', ...channelInfo });
                }
                break;
            case userMessage === '.goodnight':
                await goodnightCommand(sock, chatId);
                break;
            case userMessage === '.shayari':
                await shayariCommand(sock, chatId);
                break;
            case userMessage === '.roseday':
                await rosedayCommand(sock, chatId);
                break;
            case userMessage.startsWith('.imagine'):
                const imaginePrompt = userMessage.slice(8).trim();
                if (imaginePrompt) {
                    await imagineCommand(sock, chatId, imaginePrompt);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please provide a prompt for image generation.\nExample: .imagine a cat riding a bicycle', ...channelInfo });
                }
                break;
            default:
                // Unknown command
                await sock.sendMessage(chatId, {
                    text: `Command not recognized. Use .help to see available commands.`,
                    ...channelInfo
                });
                break;
        }
    } catch (error) {
        console.error('Error in handleMessages:', error);
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        // ===== SECURITY MODIFICATION =====
        // Disable all group participant update handling
        return;
        // ===== END SECURITY MODIFICATION =====
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

async function handleStatus(sock, update) {
    try {
        // ===== SECURITY MODIFICATION =====
        // Disable all status update handling
        return;
        // ===== END SECURITY MODIFICATION =====
    } catch (error) {
        console.error('Error in handleStatus:', error);
    }
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus
};
