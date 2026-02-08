import SearchBar from "./components/SearchBar"
import UserList from '@/app/admindashboard/components/UserList'
import esTokenDeAdmin from '@/app/lib/auth'

export default function page() {
  return (
    <>
      <div>
        <div className="pb-2">
          <SearchBar />
        </div>
        <div>
          <UserList />
        </div>
      </div>

    </>
  )
}
