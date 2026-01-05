// Supabaseの接続設定
const SUPABASE_URL = 'https://mxvumshakgwxuxyhpcgo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dnVtc2hha2d3eHV4eWhwY2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxODUyODYsImV4cCI6MjA4Mjc2MTI4Nn0.YTXMP1HURsiYgwluXjajL38s0y5vYh8TbPPpnlXiHbY';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 表示側 (mobile_order_pro2) の振り分けロジック
const renderOrder = (payload) => {
    const { order_number, id } = payload; // SupabaseのID（uuid）を受け取る
    const mobileContainer = document.getElementById('input-mobile');
    const storeContainer = document.getElementById('input-store');

    const newElement = document.createElement('h1');
    newElement.innerText = order_number;
    // 重要：要素にIDを付与（例：id="order-uuid"）
    newElement.id = `order-${id}`;
    // 先頭が 'M' かどうかで判定
    if (order_number.startsWith('M')) {
        mobileContainer.appendChild(newElement);
    } else {
        storeContainer.appendChild(newElement);
    }
};

// 番号を画面から消去する関数
const removeOrderFromScreen = (id) => {
    const element = document.getElementById(`order-${id}`);
    if (element) {
        element.remove();
    }
};

// 画面読み込み時に実行する関数
const fetchCurrentOrders = async () => {
    // 1. Supabaseから現在「waiting（呼び出し中）」のデータをすべて取得
    const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true }); // 古い順に並べる

    if (error) {
        console.error('データ取得エラー:', error);
        return;
    }

    // 2. 取得したデータを一つずつ画面に表示
    data.forEach((order) => {
        renderOrder(order); // 前に作った表示関数を再利用
    });
};

// 実行！
fetchCurrentOrders();

// リアルタイムでデータベースの変更を監視
supabaseClient
    .channel('orders_channel')
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
            renderOrder(payload.new); // payload.new には id も含まれます
        }
    )
    .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
            // payload.old.id で削除されたデータのIDが取得できます
            removeOrderFromScreen(payload.old.id);
        }
    )
    .subscribe();