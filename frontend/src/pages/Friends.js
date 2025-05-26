// src/pages/Friends.js
import { useState, useEffect, useContext, useCallback } from "react"; // <-- useCallback'i import edin
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = user?.token;
  const currentUserId = user?.id;

  // fetchData fonksiyonunu useCallback ile sarmalayın
  const fetchData = useCallback(async () => {
    if (!token || !currentUserId) return;

    setLoading(true);
    try {
      const usersRes = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(usersRes.data);

      const friendsRes = await axios.get("http://localhost:5000/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(friendsRes.data);

      const pendingRes = await axios.get(
        "http://localhost:5000/api/friends/requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingRequests(pendingRes.data);
    } catch (err) {
      toast.error("Veriler alınırken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    token,
    currentUserId,
    setAllUsers,
    setFriends,
    setPendingRequests,
    setLoading,
  ]); // <-- fetchData'nın kendi bağımlılıkları

  useEffect(() => {
    fetchData();
  }, [fetchData]); // <-- useEffect'in bağımlılık dizisine fetchData'yı ekleyin

  const sendRequest = async (receiverId) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/friends/request",
        { receiverId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message);
      await fetchData(); // Verileri yeniden çek
    } catch (err) {
      toast.error(err.response?.data?.message || "İstek gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requesterId) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/friends/accept",
        { requesterId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message);
      await fetchData(); // Verileri yeniden çek
    } catch (err) {
      toast.error(err.response?.data?.message || "İstek kabul edilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const getConnectableUsers = () => {
    const friendIds = new Set(friends.map((f) => f.id));
    const pendingRequesterIds = new Set(pendingRequests.map((req) => req.id));

    return allUsers.filter(
      (u) =>
        u.id !== currentUserId &&
        !friendIds.has(u.id) &&
        !pendingRequesterIds.has(u.id)
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 hover:scale-105 transition-transform duration-300 will-change-transform bg-gray-200 bg-opacity-60 px-40 py-5 rounded-xl w-fit mx-auto">
          Arkadaşlık Yönetimi
        </h2>

        {/* Diğer Kullanıcılar */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 hover:scale-105 transition-transform duration-300 will-change-transform bg-gray-200 bg-opacity-60 px-20 py-5 rounded-xl w-fit mx-auto">
            Tüm Kullanıcılar
          </h3>
          {loading ? (
            <p className="text-center text-gray-500">Yükleniyor...</p>
          ) : getConnectableUsers().length === 0 ? (
            <p className="text-center text-gray-500 w-fit mx-auto hover:scale-95 transition-transform duration-300 will-change-transform">
              Gönderilebilecek başka kullanıcı bulunmuyor.
            </p>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {getConnectableUsers().map((userItem) => (
                <li
                  key={userItem.id}
                  className="flex items-center justify-between gap-4 bg-blue-50 px-5 py-2 rounded-md shadow-sm border border-blue-100 w-fit mx-auto"
                >
                  <span className="font-medium text-blue-800">
                    {userItem.username}
                  </span>
                  <button
                    onClick={() => sendRequest(userItem.id)}
                    disabled={loading}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
                  >
                    İstek Gönder
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Gelen Arkadaşlık İstekleri */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 hover:scale-105 transition-transform duration-300 will-change-transform bg-gray-200 bg-opacity-60 px-5 py-5 rounded-xl w-fit mx-auto">
            Gelen Arkadaşlık İstekleri
          </h3>
          {loading ? (
            <p className="text-center text-gray-500">Yükleniyor...</p>
          ) : pendingRequests.length === 0 ? (
            <p className="text-center text-gray-500 hover:scale-95 transition-transform duration-300 will-change-transform w-fit mx-auto">
              Gelen istek yok.
            </p>
          ) : (
            <ul className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {pendingRequests.map((req) => (
                <li
                  key={req.id}
                  className="flex items-center justify-between gap-4 bg-yellow-50 px-5 py-2 rounded-md shadow-sm border border-yellow-100 w-fit mx-auto"
                >
                  <span className="font-medium text-yellow-800">
                    {req.username}
                  </span>
                  <button
                    onClick={() => acceptRequest(req.id)}
                    disabled={loading}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-green-300 transition-colors duration-200"
                  >
                    Kabul Et
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Arkadaş Listesi */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700 hover:scale-105 transition-transform duration-300 will-change-transform bg-gray-200 bg-opacity-60 px-4 py-5 rounded-xl w-fit mx-auto">
            Arkadaşlarım
          </h3>
          {loading ? (
            <p className="text-center text-gray-500">Yükleniyor...</p>
          ) : friends.length === 0 ? (
            <p className="text-center text-gray-500 hover:scale-105 transition-transform duration-300 will-change-transform">
              Henüz arkadaşın yok.
            </p>
          ) : (
            <ul className="mb-6 space-y-3 max-h-40 overflow-y-auto pr-2">
              {friends.map((friend) => (
                <li
                  key={friend.id}
                  className="text-gray-700 font-medium bg-green-50 px-6 py-2 rounded-md shadow-sm border border-green-100 w-fit mx-auto hover:scale-95 transition-transform duration-300 will-change-transform"
                >
                  {friend.username}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/user")}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 hover:scale-105 transition-transform duration-300 will-change-transform"
          >
            Panele Geri Dön
          </button>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Friends;
