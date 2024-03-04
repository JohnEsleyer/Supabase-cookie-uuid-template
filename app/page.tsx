'use client'

import { createClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import {v4 as uuidv4} from 'uuid'


const supabase = createClient('API_URL', 'API_KEY');

export default function Home() {
  const [limit, setLimit] = useState<number | null>(null);


  useEffect(() => {
    async function fetchData() {
      const userId = Cookies.get('user_id');
      if (!userId) {
        console.log("No user ID found in cookie. Creating new visitor instance.");
        const newUserId = uuidv4();
        await supabase.from('visitors').insert([{ id: newUserId, limit: 10 }]);
        Cookies.set('user_id', newUserId, { expires: 365 });
        setLimit(10);
      } else {
        console.log("User ID found in cookie. Fetching visitor data from database.");
        const { data: visitors, error } = await supabase
          .from('visitors')
          .select('limit')
          .eq('id', userId);

        if (error) {
          console.error('Error fetching visitor:', error.message);
          return;
        }

        if (visitors && visitors.length > 0) {
          setLimit(visitors[0].limit);
        } else {
          console.error('Visitor not found in database.');
          Cookies.set('user_id', '');
          window.location.reload();
        }
      }
    }

    fetchData();
    console.log('Executed useEffect');
  }, []);

  const decrementLimit = async () => {
    const userId = Cookies.get('user_id');
    if (userId && limit && limit > 0) {
      const { error } = await supabase
        .from('visitors')
        .update({ limit: limit - 1 })
        .eq('id', userId);

      if (error) {
        console.error('Error updating visitor:', error.message);
        return;
      }

      setLimit(limit - 1);
    }
  };

  return (
    <>
      {limit !== null && <h1>{limit}</h1>}
      <button onClick={decrementLimit}>Decrement Limit</button>
      {limit != null && limit <= 0 && <h1>Limit exceeded</h1>}
    </>
  );
}