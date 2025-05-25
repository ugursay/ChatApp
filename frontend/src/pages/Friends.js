// src/pages/Friends.js
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext"; // Bu satırı kaldırdık
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const { user } = useContext(AuthContext); // AuthContext doğrudan erişilebilir
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = user?.token; // Token'ı user objesinden çek
  const currentUserId = user?.id; // Mevcut kullanıcının ID'sini çek

  // Tüm kullanıcıları, arkadaşları ve bekleyen istekleri çeken fonksiyon
  const fetchData = async () => {
    if (!token || !currentUserId) return; // Token veya ID yoksa API çağrısı yapma

    setLoading(true);
    try {
      // Tüm kullanıcıları çek (kendisi hariç)
      const usersRes = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(usersRes.data);

      // Arkadaşları çek
      const friendsRes = await axios.get("http://localhost:5000/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(friendsRes.data);

      // Bekleyen istekleri çek
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
  };

  useEffect(() => {
    fetchData();
  }, [user, token, currentUserId]); // user, token veya currentUserId değiştiğinde yeniden çek

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
      fetchData(); // Verileri yeniden çek
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
      fetchData(); // Verileri yeniden çek
    } catch (err) {
      toast.error(err.response?.data?.message || "İstek kabul edilemedi.");
    } finally {
      setLoading(false);
    }
  };

  // Arkadaş olan veya istek gönderilmiş/alınmış kullanıcıları filtrele
  const getConnectableUsers = () => {
    // Halihazırda arkadaş olanların ID'leri
    const friendIds = new Set(friends.map((f) => f.id));
    // Bize pending istek göndermiş olanların ID'leri
    const pendingRequesterIds = new Set(pendingRequests.map((req) => req.id));

    // Not: Giden istekleri de filtrelemek için backend'den ayrı bir endpoint'e ihtiyacınız olabilir
    // (örneğin `/api/friends/sent-requests`) ve bu veriyi de çekmeniz gerekir.
    // Şimdilik sadece arkadaş olmayanları ve bize pending istek göndermemiş olanları gösteriyoruz.

    return allUsers.filter(
      (u) =>
        u.id !== currentUserId && // Kendi kendimize istek atmayız
        !friendIds.has(u.id) && // Zaten arkadaş değiliz
        !pendingRequesterIds.has(u.id) // Bize pending istek göndermemiş
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Arkadaşlık Yönetimi
        </h2>

        {/* Diğer Kullanıcılar */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Tüm Kullanıcılar
          </h3>
          {loading ? (
            <p className="text-center text-gray-500">Yükleniyor...</p>
          ) : getConnectableUsers().length === 0 ? (
            <p className="text-center text-gray-500">
              Gönderilebilecek başka kullanıcı bulunmuyor.
            </p>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {getConnectableUsers().map((userItem) => (
                <li
                  key={userItem.id}
                  className="flex justify-between items-center bg-blue-50 p-3 rounded-md shadow-sm border border-blue-100"
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
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Gelen Arkadaşlık İstekleri
          </h3>
          {loading ? (
            <p className="text-center text-gray-500">Yükleniyor...</p>
          ) : pendingRequests.length === 0 ? (
            <p className="text-center text-gray-500">Gelen istek yok.</p>
          ) : (
            <ul className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {pendingRequests.map((req) => (
                <li
                  key={req.id}
                  className="flex justify-between items-center bg-yellow-50 p-3 rounded-md shadow-sm border border-yellow-100"
                >
                  <span className="font-medium text-yellow-800">
                    {req.username}
                  </span>
                  <button
                    onClick={() => acceptRequest(req.id)} // req.id burada requesterId'ye denk gelir
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
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Arkadaşlarım
          </h3>
          {loading ? (
            <p className="text-center text-gray-500">Yükleniyor...</p>
          ) : friends.length === 0 ? (
            <p className="text-center text-gray-500">Henüz arkadaşın yok.</p>
          ) : (
            <ul className="mb-6 space-y-3 max-h-40 overflow-y-auto pr-2">
              {friends.map((friend) => (
                <li
                  key={friend.id}
                  className="text-gray-700 font-medium bg-green-50 p-3 rounded-md shadow-sm border border-green-100"
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
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 transition duration-300"
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
