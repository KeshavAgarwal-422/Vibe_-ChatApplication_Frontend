import { useEffect, useRef, useState } from "react";
import Img2 from "../../assets/img3.jpg";
import logout from "../../assets/icons8-logout-50 (1).png";
import vibe from "../../assets/vibe.png";
import Input from "../../components/Input";
import { io } from "socket.io-client";
import { BASE_URL } from "../../Utils/BaseUrl";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user:detail"))
  );

  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const messageRef = useRef(null);

  useEffect(() => {
    setSocket(io.connect("https://vibe-backend.onrender.com"));
  }, []);

  useEffect(() => {
    socket?.emit("addUser", user?.id);
    socket?.on("getUsers", (users) => {
      console.log("activeUsers :>> ", users);
    });
    socket?.on("getMessage", (data) => {
      setMessages((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { user: data.user, message: data.message },
        ],
      }));
    });
  }, [socket]);

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.messages]);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user:detail"));
    const fetchConversations = async () => {
      const res = await axios
        .get(`${BASE_URL}conversations/${loggedInUser?.id}`)
        .then((res) => {
          const resData = res.data;
          setConversations(resData);
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios
        .get(`${BASE_URL}users/${user?.id}`)
        .then((res) => {
          const resData = res.data;
          setUsers(resData);
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    };
    fetchUsers();
  }, []);

  const fetchMessages = async (conversationId, receiver) => {
    const res = await axios
      .get(
        `${BASE_URL}message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`
      )
      .then((res) => {
        const resData = res.data;
        setMessages({ messages: resData, receiver, conversationId });
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  const sendMessage = async (e) => {
    console.log(user);
    setMessage("");
    socket?.emit("sendMessage", {
      senderId: user?.id,
      receiverId: messages?.receiver?.receiverId,
      message,
      conversationId: messages?.conversationId,
    });

    const res = await axios
      .post(`${BASE_URL}message`, {
        conversationId: messages?.conversationId,
        senderId: user?.id,
        message,
        receiverId: messages?.receiver?.receiverId,
      })
      .then((res) => {
        const resData = res.data;
        alert(resData.message);
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  const handelLogout = () => {
    localStorage.setItem("user:token", null);
    window.location.reload();
  };

  return (
    <div className="w-screen flex">
      <div className="w-[25%] h-screen bg-secondary overflow-scroll">
        <div className="flex items-center justify-between my-8 mx-14 text-[#EEEEEE]">
          <div>
            <img
              src={vibe}
              width={75}
              height={75}
              className=" p-[2px]  object-contain rounded-lg"
              alt=""
            />
          </div>
          <div className="mx-3">
            <h3 className="text-2xl">{user?.fullName}</h3>
            <p className="text-lg font-light">My Account</p>
          </div>
          <img
            src={logout}
            width={30}
            height={75}
            alt=""
            onClick={handelLogout}
            className="cursor-pointer "
          />
        </div>
        <hr />
        <div className="mx-14 mt-10">
          <div className="text-primary text-lg">Messages</div>
          <div>
            {conversations.length > 0 ? (
              conversations.map(({ conversationId, user }) => {
                return (
                  <div className="flex items-center py-8 border-b border-b-gray-300">
                    <div
                      className="cursor-pointer flex items-center"
                      onClick={() => fetchMessages(conversationId, user)}
                    >
                      <div>
                        <img
                          src={Img2}
                          className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                          alt=""
                        />
                      </div>
                      <div className="ml-6">
                        <h3 className="text-lg font-semibold text-[#EEEEEE]">
                          {user?.fullName}
                        </h3>
                        <p className="text-sm font-light text-gray-300">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-lg font-semibold mt-24">
                No Conversations
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-[50%] h-screen bg-light">
        <div className="w-[100%] h-screen flex flex-col items-center">
          {messages?.receiver?.fullName && (
            <div className="w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14 py-2">
              <div className="cursor-pointer">
                <img
                  src={Img2}
                  width={60}
                  height={60}
                  className="rounded-full"
                  alt=""
                />
              </div>

              <div className="ml-6 mr-auto  text-[#EEEEEE]">
                <h3 className="text-lg">{messages?.receiver?.fullName}</h3>
                <p className="text-sm font-light text-gray-300">
                  {messages?.receiver?.email}
                </p>
              </div>

              <div className="cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-phone-outgoing"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="white"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                  <line x1="15" y1="9" x2="20" y2="4" />
                  <polyline points="16 4 20 4 20 8" />
                </svg>
              </div>
            </div>
          )}
          <div className="h-[75%] w-full overflow-scroll shadow-sm">
            <div className="p-14">
              {messages?.messages?.length > 0 ? (
                messages.messages.map(({ message, user: { id } = {} }) => {
                  return (
                    <>
                      <div
                        className={`max-w-[40%] rounded-b-xl p-4 mb-6 ${
                          id === user?.id
                            ? "bg-primary text-white rounded-tl-xl ml-auto"
                            : "bg-secondary rounded-tr-xl"
                        } `}
                      >
                        {message}
                      </div>
                      <div ref={messageRef}></div>
                    </>
                  );
                })
              ) : (
                <div className="text-center text-lg font-semibold mt-24  text-[#EEEEEE]">
                  No Messages or No Conversation Selected
                </div>
              )}
            </div>
          </div>
          {messages?.receiver?.fullName && (
            <div className="p-14 w-full flex items-center">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-[75%]"
                inputClassName="p-4 border-0 shadow-md rounded-full bg-secondary focus:ring-0 focus:border-0 outline-none text-[#EEEEEE]"
              />
              <div
                className={`ml-4 p-2 cursor-pointer bg-secondary  text-[#EEEEEE] rounded-full ${
                  !message && "pointer-events-none"
                }`}
                onClick={() => sendMessage()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-send"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="white"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                  <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
                </svg>
              </div>
              <div
                className={`ml-4 p-2 cursor-pointer bg-secondary rounded-full ${
                  !message && "pointer-events-none"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-circle-plus"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="white"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <circle cx="12" cy="12" r="9" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="12" y1="9" x2="12" y2="15" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-[25%] h-screen bg-secondary px-8 py-16 overflow-scroll">
        <div className="text-primary text-lg">People</div>
        <div>
          {users.length > 0 ? (
            users.map(({ user }) => {
              return (
                <div className="flex items-center py-8 border-b border-b-gray-300">
                  <div
                    className="cursor-pointer flex items-center"
                    onClick={() => fetchMessages("new", user)}
                  >
                    <div>
                      <img
                        src={Img2}
                        className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                        alt=""
                      />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-semibold text-[#EEEEEE]">
                        {user?.fullName}
                      </h3>
                      <p className="text-sm font-light text-gray-300">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-lg font-semibold mt-24  text-[#EEEEEE]">
              No Conversations
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
