import React, {useState, useEffect} from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabaseの接続設定
const SUPABASE_URL = 'https://mxvumshakgwxuxyhpcgo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dnVtc2hha2d3eHV4eWhwY2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxODUyODYsImV4cCI6MjA4Mjc2MTI4Nn0.YTXMP1HURsiYgwluXjajL38s0y5vYh8TbPPpnlXiHbY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const Mobile2 = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchCurrentOrders();
        // 2. リアルタイム購読の設定
        const channel = supabase
            .channel('orders_channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    // 新しい注文をリストに追加
                    setOrders((prevOrders) => [...prevOrders, payload.new]);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'orders' },
                (payload) => {
                    // 削除された注文をリストから除外
                    setOrders((prevOrders) =>
                        prevOrders.filter((order) => order.id !== payload.old.id)
                    );
                }
            )
            .subscribe();
        // 3. クリーンアップ（コンポーネントが消える時に購読を停止）
        return () => {
            supabase.removeChannel(channel);
        };

    }, []);

    const fetchCurrentOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'waiting')
            .order('created_at', { ascending: true }); // 古い順に並べる

        if (error) {
            console.log('初期データ取得失敗:', error);
        } else {
            setOrders(data || []);
        }
    }

    // index.jsにあった「M」から始まるかどうかのフィルタリング
    const mobileOrders = orders.filter(order => order.order_number.startsWith('M'));
    const storeOrders = orders.filter(order => !order.order_number.startsWith('M'));

    return (
        <div className={'container'}>
            <header className={"header"}>
                <img src="https://emotion-tech.co.jp/wp-content/uploads/2023/06/gongcha_logo_02.png" alt="ゴンチャ" />
                    <h1>お呼び出し中の番号</h1>
            </header>

            <main style={{ display: 'flex', justifyContent: 'space-around' }}>
                <section className={'left-panel'}>
                    <h2>モバイルオーダー</h2>
                    <div id="mobile-number">
                        {mobileOrders.map(order => (
                            <h1 key={order.id} style={{fontSize: '3rem'}}>{order.order_number}</h1>
                        ))}
                    </div>
                </section>
                <section className={'right-panel'}>
                    <h2>店頭注文</h2>
                    <div id="store-number">
                        {storeOrders.map(order => (
                            <h1 key={order.id} style={{fontSize: '3rem'}}>{order.order_number}</h1>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
